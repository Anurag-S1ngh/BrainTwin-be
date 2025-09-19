import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { createUser, findUserByEmail } from "../sevices/auth.service";
import { signJWT } from "../util/jwt";
import { AuthSchema } from "../zod-schema/auth";

export const signup = async (req: Request, res: Response) => {
  const isValidData = AuthSchema.safeParse(req.body);
  if (!isValidData.success) {
    const firstError = isValidData.error.issues[0];
    res.status(400).json({
      msg: "Invalid data",
      error: firstError?.message,
    });

    return;
  }

  const { email, password } = isValidData.data;
  const hashPassword = await bcrypt.hash(password, 10);

  try {
    createUser(email, hashPassword);
    res.status(200).json({
      msg: "sign up successful",
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        msg: "Email already exists",
        error: "An account with this email already exists",
      });
      return;
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      res.status(400).json({ msg: messages.join(", ") });
      return;
    }
    console.error("Signup error:", error);
    res.status(500).json({
      msg: "Internal server error",
      error: "An unexpected error occurred. Please try again later",
    });
    return;
  }
};

export const signin = async (req: Request, res: Response) => {
  const isValidData = AuthSchema.safeParse(req.body);

  if (!isValidData.success) {
    const firstError = isValidData.error.issues[0];

    res.status(400).json({
      msg: "Invalid data",
      error: firstError?.message,
    });

    return;
  }

  const { email, password } = isValidData.data;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        msg: "sign up first",
        error: "Please sign up before logging in",
      });
      return;
    }
    const validPassword = await bcrypt.compare(password, user.password!);
    if (!validPassword) {
      res.status(401).json({
        msg: "incorrect password",
        error: "The password you entered is incorrect",
      });
      return;
    }

    const token = signJWT(user._id);

    res.json({
      msg: "sign in successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal server error",
      error: "An unexpected error occurred. Please try again later",
    });
  }
};
