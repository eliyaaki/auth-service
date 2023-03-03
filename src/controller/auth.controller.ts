import { DocumentType } from "@typegoose/typegoose";
import { Request, Response } from "express";
import lodash from "lodash";
const { get, isUndefined } = lodash;
import { User } from "../model/user.model.js";
import { CreateSessionInput } from "../schema/auth.schema.js";
import {
  authenticateUser,
  findSessionById,
  refreshAccessToken,
  signAccessToken,
  signRefreshToken,
} from "../service/auth.service.js";
import { findUserById, findUserByEmail } from "../service/user.service.js";
import { verifyJwt } from "../utils/jwt.js";
import log from "../utils/logger.js";

export async function createSessionController(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const message = "Invalid email or password";
  const { email, password } = req.body;
  try {
    const tokens = await authenticateUser(email, password);
    // send the tokens
    return res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    return res.status(401).json({ status: 401, message: error.message });
  }
}

export async function refreshAccessTokenController(
  req: Request,
  res: Response
) {
  let refreshToken = get(req, "headers.x-refresh");
  try {
    if (isUndefined(refreshToken)) {
      return res
        .status(401)
        .json({ status: 401, message: "Refresh token doesn't exist at all" });
    }
    const accessToken = await refreshAccessToken(refreshToken as string);

    return res.status(200).send({ accessToken });
  } catch (error: any) {
    return res.status(401).json({ status: 401, message: error.message });
  }
}
