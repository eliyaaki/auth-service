import { DocumentType } from "@typegoose/typegoose";
import lodash from "lodash";
const { omit, isUndefined } = lodash;
import SessionModel from "../model/session.model.js";
import { privateFields, User } from "../model/user.model.js";
import { signJwt, verifyJwt } from "../utils/jwt.js";
import log from "../utils/logger.js";
import {
  findUserByEmail,
  findUserById,
  getUserResponseDto,
} from "./user.service.js";

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
  try {
    // sign a access token
    const accessToken = signAccessToken(user);

    // sign a refresh token
    const refreshToken = await signRefreshToken({ userId: user._id });
    return { accessToken, refreshToken };
  } catch (error) {
    log.error(`error regarding the tokens because: ${error}`);
    throw error;
  }
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<string | never> {
  const message = "Could not refresh access token";
  try {
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
      throw Error(message);
    }
    log.info(`session: ${session.user}`);
    const user = await findUserById(String(session.user));
    log.info(`user: ${user}`);
    if (!user) {
      throw Error(message);
    }

    const accessToken = signAccessToken(user);
    return accessToken;
  } catch (error) {
    log.error(`error regarding the tokens because: ${error}`);
    throw error;
  }
}

export async function createSession({ userId }: { userId: string }) {
  return SessionModel.create({ user: userId });
}

export async function findSessionById(id: string) {
  return SessionModel.findById(id);
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
  const payload = getUserResponseDto(user);
  const a = user.toJSON();
  const accessToken = signJwt(payload, "accessTokenPrivateKey", {
    expiresIn: "15m",
  });
  log.info(`accessToken: ${accessToken}`);
  return accessToken;
}
