import logger from "./logger";

export const getAccessToken = async function (source: any) {
  const tokenUrl = new URL(source);
  tokenUrl.search = "";
  tokenUrl.pathname =
    tokenUrl.pathname.replace(/[2,3]\/events$/, "") + "auth/token";

  const clientId = "test_client_id";
  const clientSecret = "test_client_secret";

  // Get the auth token from the source, use basic auth
  logger.info("Fetching access token from:", tokenUrl as any);
  logger.info("Using clientId:", clientId as any);
  const authResponse = await fetch(tokenUrl, {
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
