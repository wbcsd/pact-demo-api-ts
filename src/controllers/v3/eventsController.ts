import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { footprintsV3 } from "../../utils/footprints";
import { getAccessToken } from "../../utils/auth";

const REQUEST_FULFILLED_EVENT_TYPE =
  "org.wbcsd.pact.ProductFootprint.RequestFulfilledEvent.3";
const REQUEST_PUBLISHED_EVENT_TYPE =
  "org.wbcsd.pact.ProductFootprint.PublishedEvent.3";
const REQUEST_REJECTED_EVENT_TYPE =
  "org.wbcsd.pact.ProductFootprint.RequestRejectedEvent.3";

export const createEvent = async (req: Request, res: Response) => {
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

    // If the event type is RequestFulfilledEvent, return 200 immediately
    if (type === REQUEST_PUBLISHED_EVENT_TYPE) {
      res.status(200).send();
      return;
    }

    // Check if productId is ["urn:pact:null"] and send RequestRejectedEvent
    if (
      data.productId &&
      Array.isArray(data.productId) &&
      data.productId.length === 1 &&
      data.productId[0] === "urn:pact:null"
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

      const response = await fetch(`${source}/3/events`, {
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
      specversion: "1.0",
      id: randomUUID(),
      source: `//EventHostname/EventSubpath`,
      time: new Date().toISOString(),
      data: {
        requestEventId: req.body.id,
        pfs: [footprintsV3[0]],
      },
    };

    const token = await getAccessToken(source);

    const response = await fetch(`${source}/3/events`, {
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
