import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { UserModel } from "../mongodb/db";
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
    await UserModel.create({
      email,
      password: hashPassword,
    });
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
    const user = await UserModel.findOne({
      email,
    });
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

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
    );

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
