import bcrypt from "bcryptjs";
import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ContentModel, UserModel } from "./db";
import { tokenVerification } from "./middleware";
import { AuthSchema } from "./zodSchema";
import { upsertRecordsAndLogStats } from "./vector-db";
import { vectorDBQuery } from "./query";
import { AIResponse } from "./ai";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/signup", async (req: Request, res: Response) => {
  const isValidData = AuthSchema.safeParse(req.body);
  if (!isValidData.success) {
    const firstError = isValidData.error.issues[0];

    res.status(400).json({
      msg: "Invalid data",
      error: firstError?.message,
    });

    return;
  }
  const { email, password } = req.body;
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
});

app.post("/signin", async (req, res) => {
  const isValidData = AuthSchema.safeParse(req.body);

  if (!isValidData.success) {
    const firstError = isValidData.error.issues[0];

    res.status(400).json({
      msg: "Invalid data",
      error: firstError?.message,
    });

    return;
  }

  const { email, password } = req.body;
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
});

app.post("/content", tokenVerification, async (req: Request, res: Response) => {
  const { title, description, url, type } = req.body;
  const userId = req.userId;
  if (!userId) {
    res.json({
      msg: "sign in first",
    });
    return;
  }
  try {
    const content = await ContentModel.create({
      title,
      description,
      url,
      type: type ?? "others",
      userId: req.userId,
    });
    await UserModel.findByIdAndUpdate(req.userId, {
      $push: { contents: content._id },
    });

    await upsertRecordsAndLogStats([
      {
        id: content._id.toString(),
        chunk_text: `${title} ${description} ${url}`, // required for auto-embedding
        category: type,
        userId,
      },
    ]);
    res.json({
      msg: "content added",
      content,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: "try again later",
    });
  }
});

app.delete(
  "/content/:contentId",
  tokenVerification,
  async (req: Request, res: Response) => {
    const contentId = req.params.contentId;
    if (!contentId) {
      console.log("invalid contentId");
      return;
    }
    const userId = req.userId;
    if (!userId) {
      res.json({
        msg: "sign in first",
      });
      return;
    }
    try {
      await ContentModel.findOneAndDelete({
        _id: contentId,
        userId,
      });
      await UserModel.findByIdAndUpdate(req.userId, {
        $pull: { contents: contentId },
      });
      res.json({
        msg: "content removed",
      });
    } catch (error) {
      console.log(error);
      res.json({
        msg: "try again later",
      });
    }
  },
);

app.get(
  "/content/all",
  tokenVerification,
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      res.json({
        msg: "sign in first",
      });
      return;
    }
    try {
      const contents = await ContentModel.find({ userId: req.userId }).sort({
        _id: -1,
      });
      res.json({
        msg: "all content fetched",
        contents,
      });
    } catch (error) {
      console.log(error);
      res.json({
        msg: "try again later",
      });
    }
  },
);

app.delete(
  "/content/:id",
  tokenVerification,
  async (req: Request, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      res.json({
        msg: "sign in first",
      });
      return;
    }
    const contentId = req.params.id;
    try {
      const content = await ContentModel.findOneAndDelete({
        _id: contentId,
        userId,
      });
      await UserModel.findByIdAndUpdate(req.userId, {
        $pull: { contents: contentId },
      });
      res.json({
        msg: "content removed",
      });
    } catch (error) {
      console.log(error);
      res.json({
        msg: "try again later",
      });
    }
  },
);

app.post("/ai", tokenVerification, async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.json({
      msg: "sign in first",
    });
    return;
  }
  const { query } = req.body;
  const content = await vectorDBQuery(query, userId);
  const aiResponse = await AIResponse(content, query);
  res.json({
    msg: "ai response fetched",
    aiResponse,
  });
  return;
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1/my_database");
  app.listen(3000);
}

await main();
