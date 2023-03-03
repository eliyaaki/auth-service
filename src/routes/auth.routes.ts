import express from "express";
import {
  createSessionController,
  refreshAccessTokenController,
} from "../controller/auth.controller.js";
import validateResource from "../middleware/ValidateResourse.js";
import { createSessionSchema } from "../schema/auth.schema.js";

const authRouter = express.Router();

authRouter.post(
  "/api/auth/sessions",
  validateResource(createSessionSchema),
  createSessionController
);

authRouter.post("/api/auth/sessions/refresh", refreshAccessTokenController);

export default authRouter;
