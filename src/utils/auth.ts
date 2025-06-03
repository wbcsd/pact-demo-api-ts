export const getAccessToken = async function (source: any) {
  const sourceUrl = new URL(source);
  sourceUrl.search = "";
  const cleanSource = sourceUrl.toString();
  const baseSourceUrl = cleanSource.replace("/3/events", "");
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
};
