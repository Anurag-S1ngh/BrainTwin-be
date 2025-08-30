import { signin, signup } from "../controllers/auth";

export const authRouter = require("express").Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
