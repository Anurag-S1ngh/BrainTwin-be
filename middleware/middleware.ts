import "dotenv/config";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

function tokenVerification(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.headers.authorization;
  if (!token) {
    res.json({
      msg: "sign up first",
    });
    return;
  }
  const decodeToken = jwt.verify(
    token,
    process.env.JWT_SECRET as string,
  ) as JwtPayload;
  req.userId = decodeToken.userId;
  next();
}

export { tokenVerification };
