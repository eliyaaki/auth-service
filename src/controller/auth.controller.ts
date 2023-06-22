import { DocumentType } from "@typegoose/typegoose";
import { Request, Response } from "express";
import lodash from "lodash";
const { get, isUndefined } = lodash;
import { CreateSessionInput } from "../schema/auth.schema";
import {
  authenticateUser,
  findSessionById,
  refreshAccessToken,
  signAccessToken,
  signRefreshToken,
} from "../service/auth.service";
import NotFoundError from "../exceptions/NotFoundError";
import InternalServerError from "../exceptions/InternalServerError";
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
    if (error instanceof InternalServerError) {
      return res.status(500).json({ error: "Internal Server Error" });
    } else if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
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
    if (error instanceof InternalServerError) {
      return res.status(500).json({ error: "Internal Server Error" });
    } else if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    } else {
      return res.status(400).json({ error: error.message });
    }
  }
}
