import express from "express";
import {
  createContent,
  deleteContentRoute,
  fetchAllContent,
} from "../controllers/content";
import { tokenVerification } from "../middleware/middleware";

export const contentRouter = express.Router();

contentRouter.get("/all", tokenVerification, fetchAllContent);
contentRouter.post("/", tokenVerification, createContent);
contentRouter.delete("/:contentId", tokenVerification, deleteContentRoute);
