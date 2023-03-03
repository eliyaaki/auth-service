import express from "express";
import {
  getAllUsersController,
  createUserController,
  forgottenPasswordController,
  resetPasswordController,
  verifyUserController,
  getUserByEmailController,
} from "../controller/user.controller.js";
import requireUser from "../middleware/requireUser.js";
import validateResource from "../middleware/ValidateResourse.js";
import {
  createUserSchema,
  forgottenPasswordSchema,
  getUserByEmailSchema,
  resetPasswordSchema,
  verifyUserSchema,
} from "../schema/user.schema.js";

const userRouter = express.Router();

userRouter.get("/api/users/getAllUsers", requireUser, getAllUsersController);

userRouter.get(
  "/api/users/getUserByEmail/:email",
  validateResource(getUserByEmailSchema),
  getUserByEmailController
);
userRouter.post(
  "/api/users",
  validateResource(createUserSchema),
  createUserController
);
userRouter.post(
  "/api/users/verify/:id/:verificationCode",
  validateResource(verifyUserSchema),
  verifyUserController
);
userRouter.post(
  "/api/users/forgottenPassword",
  validateResource(forgottenPasswordSchema),
  forgottenPasswordController
);
userRouter.post(
  "/api/users/resetPassword/:id/:passwordResetCode",
  validateResource(resetPasswordSchema),
  resetPasswordController
);

export default userRouter;
