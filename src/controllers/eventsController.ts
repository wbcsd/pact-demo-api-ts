import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { footprints } from "../utils/footprints";

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
      type: "org.wbcsd.pathfinder.ProductFootprintRequest.Fulfilled.v1",
      specversion: "1.0",
      id: randomUUID(),
      source: `//EventHostname/EventSubpath`,
      time: new Date().toISOString(),
      data: {
        requestEventId: req.body.id,
        pfs: [footprints[0]],
      },
    };

    const token = await getAccessToken(source);

    const response = await fetch(source, {
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

async function getAccessToken(source: any) {
  const sourceUrl = new URL(source);
  sourceUrl.search = "";
  const cleanSource = sourceUrl.toString();
  const baseSourceUrl = cleanSource.replace("/2/events", "");
  const authUrl = `${baseSourceUrl}/auth/token`;

  const clientId = "test_client_id";
  const clientSecret = "test_client_secret";

  // Get the auth token from the source, use basic auth
  const authResponse = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
  });

  const token = (await authResponse.json()).access_token;
  return token;
}
