import "dotenv/config";
import type { NextFunction, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { CustomExpressRequest } from "../types/types";

function tokenVerification(
  req: CustomExpressRequest,
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
