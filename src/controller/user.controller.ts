import { Request, Response } from "express";
import { FlattenMaps, LeanDocument } from "mongoose";
import { User } from "../model/user.model.js";
import {
  CreateUserInput,
  VerifyUserInput,
  ForgottenPasswordInput,
  ResetPasswordInput,
  GetUserByEmailInput,
} from "../schema/user.schema.js";
import {
  createUser,
  verifyUser,
  forgottenPassword,
  resetPassword,
  getAllUsers,
  findUserByEmail,
  getUserResponseDto,
} from "../service/user.service.js";
import log from "../utils/logger.js";
import sendEmail from "../utils/mailer.js";

export async function getAllUsersController(
  req: Request<{}, {}, {}>,
  res: Response
) {
  try {
    const allUsers = await getAllUsers();
    if (!allUsers) {
      throw Error("Users not found");
    }
    const allUserDtos = allUsers.map((user) => getUserResponseDto(user));
    log.info("all users: " + allUserDtos);
    return res.status(200).json({ status: 200, data: allUserDtos });
  } catch (error: any) {
    return res.status(400).json({ status: 400, message: error.message });
  }
}
export async function getUserByEmailController(
  req: Request<GetUserByEmailInput>,
  res: Response
) {
  try {
    const user = await findUserByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    const userResponseDto = getUserResponseDto(user);
    log.info("user: " + userResponseDto);
    return res.status(200).json({ status: 200, user: userResponseDto });
  } catch (error: any) {
    return res.status(500).json({ status: 500, message: error.message });
  }
}

export async function createUserController(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  try {
    const body = req.body;
    const user = await createUser(body);
    log.info(`user created successfully, user: ${user}`);
    return (
      res
        // .send("user created successfully")
        .status(201)
        .json({ status: 201, user })
    );
  } catch (error: any) {
    log.error(error);
    return res.status(400).json({ status: 400, message: error.message });
  }
}

export async function verifyUserController(
  req: Request<VerifyUserInput>,
  res: Response
) {
  try {
    const id = req.params.id;
    const verificationCode = req.params.verificationCode;
    await verifyUser(id, verificationCode);
    return res.status(200).send("user verified successfully");
  } catch (error: any) {
    if (error.name === "ValidationError") {
      // let errors={};
      log.error(error);
      const message = Object.values(error.errors).map(
        (val: any) => val.message
      );
      return res.status(400).json({ status: 400, message: message });
    }

    log.error(error);
    return res.status(400).json({ status: 400, message: error.message });
  }
}

export async function forgottenPasswordController(
  req: Request<{}, {}, ForgottenPasswordInput>,
  res: Response
) {
  try {
    const email = req.body.email;
    await forgottenPassword(email);
    return res.send("reset information sent successfully").status(200);
  } catch (error: any) {
    return res.status(400).json({ status: 400, message: error.message });
  }
}

export async function resetPasswordController(
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response
) {
  try {
    const { id, passwordResetCode } = req.params;
    const { password } = req.body;
    await resetPassword(id, passwordResetCode, password);
    return res.send("your password has been reset successfully").status(200);
  } catch (error: any) {
    return res.status(400).json({ status: 400, message: error.message });
  }
}
