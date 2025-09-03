import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { contentRouter } from "./routes/content";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: "Too many requests" });
  },
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(limiter);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/ai", aiRouter);

async function main() {
  await mongoose.connect("mongodb://localhost:27017");
  app.listen(3000);
}
await main();
