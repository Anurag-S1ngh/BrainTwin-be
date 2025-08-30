import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { aiRouter } from "./routes/ai";
import { authRouter } from "./routes/auth";
import { contentRouter } from "./routes/content";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/ai", aiRouter);

async function main() {
  await mongoose.connect("mongodb://127.0.0.1/my_database");
  app.listen(3000);
}
await main();
