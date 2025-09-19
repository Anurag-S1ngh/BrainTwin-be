import type { Response } from "express";
import { ContentModel, UserModel } from "../mongodb/db";
import type { CustomExpressRequest } from "../types/types";
import { upsertRecordsAndLogStats } from "../vector-db/vector-db";
import { contentSchema } from "../zod-schema/content";
import { deleteContent, fetchContent } from "../sevices/content.service";

export const fetchAllContent = async (
  req: CustomExpressRequest,
  res: Response,
) => {
  const userID = req.userId;
  if (!userID) {
    res.json({
      msg: "sign in first",
    });
    return;
  }
  try {
    const contents = await fetchContent(userID);
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
};

export const createContent = async (
  req: CustomExpressRequest,
  res: Response,
) => {
  const userID = req.userId;
  if (!userID) {
    res.json({
      msg: "sign in first",
    });
    return;
  }
  const isValidData = contentSchema.safeParse(req.body);
  if (!isValidData.success) {
    const firstError = isValidData.error.issues[0];
    res.status(400).json({
      msg: "Invalid data",
      error: firstError?.message,
    });
    return;
  }
  const { title, description, url, type } = isValidData.data;

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
        userId: userID,
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
};

export const deleteContentRoute = async (
  req: CustomExpressRequest,
  res: Response,
) => {
  const contentId = req.params.contentId;
  if (!contentId) {
    console.log("invalid contentId");
    return;
  }
  const userID = req.userId;
  if (!userID) {
    res.json({
      msg: "sign in first",
    });
    return;
  }
  try {
    await deleteContent(contentId, userID);
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
};
