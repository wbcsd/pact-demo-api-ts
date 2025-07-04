import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_VERIFY_SECRET = process.env.JWT_VERIFY_SECRET || "default_secret";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_VERIFY_SECRET);
      res.locals.client = decoded;

      next();
    } catch (err) {
      console.log(err);
      res.status(400).json({ code: "BadRequest" });
    }
  } else {
    res.status(400).json({ code: "BadRequest" });
  }
};
