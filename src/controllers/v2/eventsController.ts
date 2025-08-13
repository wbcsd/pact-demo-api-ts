import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { footprints } from "../../utils/footprints";
import { getAccessToken } from "../../utils/auth";

const REQUEST_FULFILLED_EVENT_TYPE = "org.wbcsd.pathfinder.ProductFootprintRequest.Fulfilled.v1";
const REQUEST_PUBLISHED_EVENT_TYPE = "org.wbcsd.pathfinder.ProductFootprint.Published.v1";
const REQUEST_REJECTED_EVENT_TYPE = "org.wbcsd.pathfinder.ProductFootprintRequest.Rejected.v1";

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    // Log the incoming request body
    console.log("Received webhook request:", JSON.stringify(req.body, null, 2));

    const { specversion, source, type, data } = req.body;

    if (!specversion || !source || !type || !data) {
      res.status(400).json({
        error: "Missing required fields in request body",
      });
      return;
    }

    // If the event type is RequestFulfilledEvent, check pfIds and return immediately
    if (type === REQUEST_PUBLISHED_EVENT_TYPE) {
      if (data.pfIds && Array.isArray(data.pfIds)) {
        // check that all id's are valid guids
        const valid = data.pfIds.every((pfId: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pfId)
        );
        if (valid) {
          res.status(200).send();
          return;
        }
      }
      res.status(400).json({
        error: "Invalid pfId format",
      });
      return;
    }

    // Check if productId is ["urn:pact:null"] and send RequestRejectedEvent
    if (
      data.pf &&
      data.pf.productIds &&
      Array.isArray(data.pf.productIds) &&
      data.pf.productIds.length === 1 &&
      data.pf.productIds[0] === "urn:pact:null"
    ) {
      const rejectedPayload = {
        type: REQUEST_REJECTED_EVENT_TYPE,
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
      };

      const token = await getAccessToken(source);

      const response = await fetch(`${source}/2/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rejectedPayload),
      });

      if (!response.ok) {
        console.error(
          `Failed to send rejected response to ${source}. Status: ${response.status}`
        );
      } else {
        console.log(
          "Successfully sent RequestRejectedEvent for null productId"
        );
      }

      res.status(200).send();
      return;
    }

    // Prepare the response payload using v3 event format
    const responsePayload = {
      type: REQUEST_FULFILLED_EVENT_TYPE,
      specversion,
      id: randomUUID(),
      source: `//EventHostname/EventSubpath`,
      time: new Date().toISOString(),
      data: {
        requestEventId: req.body.id,
        pfs: [footprints[0]],
      },
    };

    const token = await getAccessToken(source);

    const response = await fetch(`${source}/2/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(responsePayload),
    });

    if (!response.ok) {
      console.error(
        `Failed to send response to ${source}. Status: ${response.status}`
      );
      res.status(502).json({
        error: `Failed to forward request to ${source}`,
        status: response.status,
      });
      return;
    }

    const responseData = await response.text();
    console.log("Response from destination:", responseData);

    // Return success response
    res.status(200).send();
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Internal server error processing webhook",
      details: error instanceof Error ? error.message : String(error),
    });
    return;
  }
};
