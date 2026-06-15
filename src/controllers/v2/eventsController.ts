import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { EventTypes } from "@wbcsd/pact-data-model/v2_0";
import { schema } from "@wbcsd/pact-data-model/v2_0/schema";
import { validate } from "@wbcsd/pact-data-model/common";
import { footprints } from "../../utils/footprints";
import { getAccessToken } from "../../utils/auth";
import logger from "../../utils/logger";

export const createEvent = async (req: Request, res: Response) => {
  try {
    // Log the incoming request body
    logger.info(
      "Received webhook request:",
      JSON.stringify(req.body, null, 2) as any
    );

    const { specversion, source, type, data } = req.body;

    if (!specversion || !source || !type || !data) {
      res.status(400).json({
        code: "BadRequest",
        message: "Missing required fields in request body",
      });
      return;
    }

    // Validate against the appropriate schema for this event type
    const eventSchema =
      type === EventTypes.Published
        ? schema.PublishedEvent
        : type === EventTypes.RequestCreated
          ? schema.RequestCreatedEvent
          : null;

    if (eventSchema) {
      const validation = validate(eventSchema, req.body);
      if (!validation.valid) {
        res.status(400).json({
          code: "BadRequest",
          message: validation.errors.join("; "),
        });
        return;
      }
    }

    // Inbound PublishedEvent: validate pfIds and acknowledge
    if (type === EventTypes.Published) {
      if (data.pfIds && Array.isArray(data.pfIds)) {
        // check that all id's are valid guids
        const valid = data.pfIds.every((pfId: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            pfId
          )
        );
        if (valid) {
          res.status(200).send();
          return;
        }
      }
      res.status(400).json({
        code: "BadRequest",
        message: "Invalid pfId format",
      });
      return;
    }

    // Only send callbacks for RequestCreated; acknowledge everything else immediately
    if (type !== EventTypes.RequestCreated) {
      res.status(200).send();
      return;
    }

    // Acknowledge receipt immediately (PACT spec: 200 = received, callback is async)
    res.status(200).send();

    // Fire-and-forget: send fulfillment or rejection back to source
    void (async () => {
      try {
        const token = await getAccessToken(source);
        const isNullRequest =
          data.pf?.productIds?.length === 1 &&
          data.pf.productIds[0] === "urn:pact:null";
        const responsePayload = isNullRequest
          ? {
              type: EventTypes.RequestRejected,
              specversion: "1.0",
              id: randomUUID(),
              source: `//EventHostname/EventSubpath`,
              time: new Date().toISOString(),
              data: {
                requestEventId: req.body.id,
                error: {
                  code: "NotFound",
                  message: "The requested footprint could not be found.",
                },
              },
            }
          : {
              type: EventTypes.RequestFulfilled,
              specversion,
              id: randomUUID(),
              source: `//EventHostname/EventSubpath`,
              time: new Date().toISOString(),
              data: {
                requestEventId: req.body.id,
                pfs: [footprints[0]],
              },
            };

        const response = await fetch(`${source}/2/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(responsePayload),
        });

        if (!response.ok) {
          logger.error(
            `Failed to send callback to ${source}. Status: ${response.status}`
          );
        } else {
          logger.info(
            `Successfully sent ${isNullRequest ? "RequestRejectedEvent" : "RequestFulfilledEvent"} to ${source}`
          );
        }
      } catch (err) {
        logger.error(`Failed to send callback to ${source}:`, err);
      }
    })();
  } catch (error) {
    logger.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Internal server error processing webhook",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
