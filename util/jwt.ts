import jwt from "jsonwebtoken";
import Schema from "mongoose";

export const signJWT = (id: Schema.Types.ObjectId) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET as string);
};
