import express from "express";
import {
  getAllUsersController,
  createUserController,
  forgottenPasswordController,
  resetPasswordController,
  verifyUserController,
  getUserByEmailController,
} from "../controller/user.controller";
import requireUser from "../middleware/requireUser";
import validateResource from "../middleware/ValidateResourse";
import {
  createUserSchema,
  forgottenPasswordSchema,
  getUserByEmailSchema,
  resetPasswordSchema,
  verifyUserSchema,
} from "../schema/user.schema";

const userRouter = express.Router();

userRouter.get("/api/users/getAllUsers", requireUser, getAllUsersController);

userRouter.get(
  "/api/users/getUserByEmail/:email",
  requireUser,
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
