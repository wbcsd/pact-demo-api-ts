import logger from "./logger";

export const getAccessToken = async function (
  source: any,
  clientId = "test_client_id",
  clientSecret = "test_client_secret"
) {
  const tokenUrl = new URL(source);
  tokenUrl.search = "";
  tokenUrl.pathname =
    tokenUrl.pathname.replace(/[2,3]\/events$/, "") + "auth/token";

  // Get the auth token from the source, use basic auth
  logger.info("Fetching access token from:", tokenUrl as any);
  const authResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!authResponse.ok) {
    const detail = await authResponse.text().catch(() => "");
    throw new Error(
      `Authentication failed: ${authResponse.status} ${authResponse.statusText}${
        detail ? ` - ${detail}` : ""
      }`
    );
  }

  const token = (await authResponse.json()).access_token;
  return token;
};
