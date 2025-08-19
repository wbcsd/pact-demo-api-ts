import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_VERIFY_SECRET as string);
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
