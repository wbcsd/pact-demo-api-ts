import logger from "./logger";

export const getAccessToken = async function (source: any) {
  const baseUrl = new URL(source);
  baseUrl.search = "";
  baseUrl.pathname = baseUrl.pathname.replace(/[2,3]\/events$/, "");

  // Default token endpoint if discovery fails
  let tokenEndpoint = new URL("auth/token", baseUrl).toString();

  // If OpenID Connect discovery is enabled, fetch the token endpoint from the discovery document
  const discoveryUrl = new URL("/.well-known/openid-configuration", baseUrl);
  logger.info("Fetching OpenID Connect discovery from:", discoveryUrl.toString() as any);
  try {
    const discoveryResponse = await fetch(discoveryUrl.toString());
    const discovery = await discoveryResponse.json();
    tokenEndpoint = discovery.token_endpoint;
  } catch (error) {
    logger.info("Failed to fetch OpenID Connect discovery document. Falling back to default token endpoint. Error:", error);
    tokenEndpoint = new URL("auth/token", baseUrl).toString();
  }

  // For simplicity, we use hardcoded client credentials here. 
  // In a real implementation, you would likely want to fetch these 
  // from a secure store or environment variables.
  const clientId = "test_client_id";
  const clientSecret = "test_client_secret";

  // Get the auth token from the source, use basic auth
  logger.info("Fetching access token from:", tokenEndpoint as any);
  logger.info("Using clientId:", clientId as any);
  const authResponse = await fetch(tokenEndpoint, {
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
};
