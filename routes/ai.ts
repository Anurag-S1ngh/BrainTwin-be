import express from "express";
import { tokenVerification } from "../middleware/middleware";
import { aiQuery } from "../controllers/ai";

export const aiRouter = express.Router();

aiRouter.post("/", tokenVerification, aiQuery);
