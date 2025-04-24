import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const getToken = (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.status(401).json({ error: "Authorization header missing or invalid" });
    return;
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [client_id, client_secret] = credentials.split(":");

  if (!client_id || !client_secret) {
    res.status(400).json({
      error: "Missing client_id or client_secret in Basic auth header",
    });
    return;
  }

  if (
    client_id !== "test_client_id" ||
    client_secret !== "test_client_secret"
  ) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const tokenPayload = { client_id };
  const secret = process.env.JWT_VERIFY_SECRET || "default_secret";

  const access_token = jwt.sign(tokenPayload, secret, { expiresIn: "1h" });
  res.status(200).json({ access_token });
};
