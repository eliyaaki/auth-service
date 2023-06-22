import { Request, Response } from "express";
import {
  CreateUserInput,
  VerifyUserInput,
  ForgottenPasswordInput,
  ResetPasswordInput,
  GetUserByEmailInput,
} from "../schema/user.schema";
import {
  createUser,
  verifyUser,
  forgottenPassword,
  resetPassword,
  getAllUsers,
  findUserByEmail,
} from "../service/user.service";
import log from "../utils/logger";
import { getUserResponseDto } from "../converter/appConverter";

import ValidationError from "../exceptions/ValidationError";
import NotFoundError from "../exceptions/NotFoundError";
import InternalServerError from "../exceptions/InternalServerError";
export async function getAllUsersController(
  req: Request<{}, {}, {}>,
  res: Response
) {
  try {
    const allUsers = await getAllUsers();
    const allUserDtos = allUsers.map((user) => getUserResponseDto(user));
    log.info("all users: " + allUserDtos);
    return res.status(200).json({ status: 200, users: allUserDtos });
  } catch (error: any) {
    log.error(error);
    if (error instanceof InternalServerError) {
      return res.status(500).json({ error: "Internal Server Error" });
    } else if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
  }
}
export async function getUserByEmailController(
  req: Request<GetUserByEmailInput>,
  res: Response
) {
  try {
    const user = await findUserByEmail(req.params.email);
    if (user) {
      const userResponseDto = getUserResponseDto(user);
      log.info("userResponseDto: ", userResponseDto);
      return res.status(200).json({ status: 200, user: userResponseDto });
    }
  } catch (error: any) {
    log.error(error);
    if (error instanceof InternalServerError) {
      return res.status(500).json({ error: "Internal Server Error" });
    } else if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
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
    return res.status(201).json({ status: 201, user });
  } catch (error: any) {
    log.error(error);
    if (error instanceof InternalServerError) {
      return res.status(500).json({ error: "Internal Server Error" });
    } else if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
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
    log.error(error);
    if (error instanceof InternalServerError) {
      return res.status(500).json({ error: "Internal Server Error" });
    } else if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
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
    log.error(error);
    if (error instanceof InternalServerError) {
      return res.status(500).json({ error: "Internal Server Error" });
    } else if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
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
    log.error(error);
    if (error instanceof InternalServerError) {
      return res.status(500).json({ error: "Internal Server Error" });
    } else if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
  }
}
