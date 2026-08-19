import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { PactApiClient } from "@wbcsd/pact-api-client";
import { EventTypes } from "@wbcsd/pact-data-model/v2_0";
import { footprints, footprintsV3 } from "../utils/footprints";
import { getAccessToken } from "../utils/auth";
import {
  clearRequests,
  getRequest,
  listRequests,
  removeRequest,
  updateRequest,
} from "../utils/requestQueue";
import logger from "../utils/logger";

// Return the queue of received requests for the dashboard.
export const getRequests = (_req: Request, res: Response) => {
  res.status(200).json({ data: listRequests() });
};

// Empty the queue. Pass ?resolvedOnly=true to keep pending/failed entries.
export const clearRequestQueue = (req: Request, res: Response) => {
  const resolvedOnly = req.query.resolvedOnly === "true";
  const removed = clearRequests(resolvedOnly);
  logger.info(`Cleared ${removed} request(s) from the queue`);
  res.status(200).json({ removed });
};

// Remove a single request from the queue.
export const deleteRequest = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!removeRequest(id)) {
    res.status(404).json({
      code: "NotFound",
      message: `Request with id ${id} not found.`,
    });
    return;
  }
  res.status(204).send();
};

// Send a RequestFulfilled / RequestRejected callback to a v2 source node,
// authenticating with the operator-supplied credentials.
const sendV2Callback = async (
  source: string,
  requestEventId: string,
  clientId: string,
  clientSecret: string,
  kind: "fulfill" | "reject"
) => {
  const token = await getAccessToken(source, clientId, clientSecret);

  const payload =
    kind === "reject"
      ? {
          type: EventTypes.RequestRejected,
          specversion: "1.0",
          id: randomUUID(),
          source: `//EventHostname/EventSubpath`,
          time: new Date().toISOString(),
          data: {
            requestEventId,
            error: {
              code: "NotFound",
              message: "The requested footprint could not be found.",
            },
          },
        }
      : {
          type: EventTypes.RequestFulfilled,
          specversion: "1.0",
          id: randomUUID(),
          source: `//EventHostname/EventSubpath`,
          time: new Date().toISOString(),
          data: {
            requestEventId,
            pfs: [footprints[0]],
          },
        };

  const response = await fetch(`${source}/2/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Callback failed: ${response.status} ${response.statusText}${
        detail ? ` - ${detail}` : ""
      }`
    );
  }
};

const resolveRequest = async (
  req: Request,
  res: Response,
  kind: "fulfill" | "reject"
) => {
  const { id } = req.params;
  const { clientId, clientSecret } = req.body ?? {};

  const entry = getRequest(id);
  if (!entry) {
    res.status(404).json({
      code: "NotFound",
      message: `Request with id ${id} not found.`,
    });
    return;
  }

  if (!clientId || !clientSecret) {
    res.status(400).json({
      code: "BadRequest",
      message: "clientId and clientSecret are required.",
    });
    return;
  }

  try {
    if (entry.version === "v3") {
      const client = new PactApiClient(entry.source, clientId, clientSecret);
      if (kind === "reject") {
        await client.rejectFootprint(entry.requestEventId, {
          code: "NotFound",
          message: "The requested footprint could not be found.",
        });
      } else {
        await client.fulfillFootprint(entry.requestEventId, [footprintsV3[0]]);
      }
    } else {
      await sendV2Callback(
        entry.source,
        entry.requestEventId,
        clientId,
        clientSecret,
        kind
      );
    }

    const updated = updateRequest(id, {
      status: kind === "reject" ? "rejected" : "fulfilled",
      resolvedAt: new Date().toISOString(),
      error: undefined,
    });
    logger.info(
      `Sent ${kind === "reject" ? "RequestRejected" : "RequestFulfilled"} for ${entry.requestEventId} to ${entry.source}`
    );
    res.status(200).json({ data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    updateRequest(id, { status: "failed", error: message });
    logger.error(`Failed to send callback to ${entry.source}:`, err);
    res.status(502).json({ code: "CallbackFailed", message });
  }
};

export const fulfillRequest = (req: Request, res: Response) =>
  resolveRequest(req, res, "fulfill");

export const rejectRequest = (req: Request, res: Response) =>
  resolveRequest(req, res, "reject");
