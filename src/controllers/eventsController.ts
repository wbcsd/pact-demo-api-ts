import { Request, Response } from "express";
import { randomUUID } from "crypto";

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

    // Prepare the response payload
    const responsePayload = {
      type: "org.wbcsd.pathfinder.ProductFootprint.Published.v1",
      specversion: "1.0",
      id: randomUUID(),
      source: `//EventHostname/EventSubpath`,
      time: new Date().toISOString(),
      data: {
        pfIds: data.pf?.productIds || [],
      },
    };

    console.log(
      `Sending response to ${source}:`,
      JSON.stringify(responsePayload, null, 2)
    );

    // Send the POST request to the source URL
    // TODO authenticate the request to the source. In our case it will use the testing tool's api credentials
    const response = await fetch(source, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

    const responseData = await response.json();
    console.log("Response from destination:", responseData);

    // Return success response
    res.status(200).json({
      message: "Webhook processed successfully",
      forwardedTo: source,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Internal server error processing webhook",
      details: error instanceof Error ? error.message : String(error),
    });
    return;
  }
};
