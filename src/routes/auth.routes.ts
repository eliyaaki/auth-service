import express from "express";
import {
  createSessionController,
  refreshAccessTokenController,
} from "../controller/auth.controller";
import validateResource from "../middleware/ValidateResourse";
import { createSessionSchema } from "../schema/auth.schema";

const authRouter = express.Router();

authRouter.post(
  "/api/auth/sessions",
  validateResource(createSessionSchema),
  createSessionController
);

authRouter.post("/api/auth/sessions/refresh", refreshAccessTokenController);

export default authRouter;
