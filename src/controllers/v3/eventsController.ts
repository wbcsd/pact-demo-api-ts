import { Request, Response } from "express";
import { PactApiClient } from "@wbcsd/pact-api-client";
import { footprintsV3 } from "../../utils/footprints";
import logger from "../../utils/logger";

const REQUEST_PUBLISHED_EVENT_TYPE =
  "org.wbcsd.pact.ProductFootprint.PublishedEvent.3";

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
        error: "Missing required fields in request body",
      });
      return;
    }

    // If the event type is RequestFulfilledEvent, check pfIds and return immediately
    if (type === REQUEST_PUBLISHED_EVENT_TYPE) {
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
        error: "Invalid pfId format",
      });
      return;
    }

    // Check if productId is ["urn:pact:null"] and send RequestRejectedEvent
    if (
      data.productId &&
      Array.isArray(data.productId) &&
      data.productId.length === 1 &&
      data.productId[0] === "urn:pact:null"
    ) {
      const client = new PactApiClient(
        source,
        "test_client_id",
        "test_client_secret",
        "//EventHostname/EventSubpath"
      );

      try {
        await client.rejectFootprint(req.body.id, {
          code: "NotFound",
          message: "The requested footprint could not be found.",
        });
        logger.info("Successfully sent RequestRejectedEvent for null productId");
      } catch (err) {
        logger.error(`Failed to send rejected response to ${source}:`, err);
      }

      res.status(200).send();
      return;
    }

    const client = new PactApiClient(
      source,
      "test_client_id",
      "test_client_secret",
      "//EventHostname/EventSubpath"
    );

    // Cast needed: local model uses string literals; package uses a ProductFootprintStatus enum
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await client.fulfillFootprint(req.body.id, [footprintsV3[0] as any]);
    logger.info(`Successfully sent RequestFulfilledEvent to ${source}`);

    // Return success response
    res.status(200).send();
  } catch (error) {
    logger.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Internal server error processing webhook",
      details: error instanceof Error ? error.message : String(error),
    });
    return;
  }
};
