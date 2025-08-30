import type { Request, Response } from "express";
import { AIResponse } from "../ai/ai";
import { vectorDBQuery } from "../vector-db/query";
import { aiQuerySchema } from "../zod-schema/ai";

export const aiQuery = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.json({
      msg: "sign in first",
    });
    return;
  }
  const isValidData = aiQuerySchema.safeParse(req.body);
  if (!isValidData.success) {
    const firstError = isValidData.error.issues[0];
    res.status(400).json({
      msg: "Invalid data",
      error: firstError?.message,
    });
    return;
  }
  const { query } = isValidData.data;
  const content = await vectorDBQuery(query, userId);
  const aiResponse = await AIResponse(content, query);
  res.json({
    msg: "ai response fetched",
    aiResponse,
  });
  return;
};
