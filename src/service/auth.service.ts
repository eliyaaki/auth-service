import { DocumentType } from "@typegoose/typegoose";
import lodash from "lodash";
const { omit, isUndefined } = lodash;
import SessionModel from "../model/session.model";
import { privateFields, User } from "../model/user.model";
import { signJwt, verifyJwt } from "../utils/jwt";
import log from "../utils/logger";
import { findUserByEmail, findUserById } from "./user.service";
import { getUserResponseDto } from "../converter/appConverter";

import ValidationError from "../exceptions/ValidationError";
import NotFoundError from "../exceptions/NotFoundError";
import InternalServerError from "../exceptions/InternalServerError";
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string } | never> {
  const message = "Invalid email or password";

  const user = await findUserByEmail(email);

  const isValid = await user?.validatePassword(password);

  if (!user || !isValid) {
    throw Error(message);
  }

  if (!user.verified) {
    throw Error("Please verify your email");
  }
  // sign a access token
  const accessToken = signAccessToken(user);

  // sign a refresh token
  const refreshToken = await signRefreshToken({ userId: user._id });
  return { accessToken, refreshToken };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<string | never> {
  const message = "Could not refresh access token";
  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );
  log.info(`decoded: ${decoded}`);
  if (!decoded) {
    throw Error(message);
  }

  const session = await findSessionById(decoded.session);
  if (!session || !session.valid) {
    throw new NotFoundError(message);
  }
  log.info(`session: ${session.user}`);
  const user = await findUserById(String(session.user));
  log.info(`user: ${user}`);
  if (!user) {
    throw Error(message);
  }

  const accessToken = signAccessToken(user);
  return accessToken;
}

export async function createSession({ userId }: { userId: string }) {
  try {
    return SessionModel.create({ user: userId });
  } catch (error) {
    throw new InternalServerError("Error creating session");
  }
}

export async function findSessionById(id: string) {
  try {
    return SessionModel.findById(id);
  } catch (error) {
    throw new NotFoundError("couldn't find session");
  }
}

export async function signRefreshToken({ userId }: { userId: string }) {
  const session = await createSession({
    userId,
  });

  log.info(`session: ${session}`);
  const refreshToken = signJwt(
    {
      session: session._id,
    },
    "refreshTokenPrivateKey",
    {
      expiresIn: "1y",
    }
  );

  log.info(`refreshToken: ${refreshToken}`);
  return refreshToken;
}

export function signAccessToken(user: DocumentType<User>) {
  try {
    const payload = getUserResponseDto(user);
    const accessToken = signJwt(payload, "accessTokenPrivateKey", {
      expiresIn: "15m",
    });
    log.info(`accessToken: ${accessToken}`);
    return accessToken;
  } catch (error: any) {
    log.error(`Could not sign access token`);
    throw new InternalServerError(error.message);
  }
}
