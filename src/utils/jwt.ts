import jwt from "jsonwebtoken";
import lodash from "lodash";
import log from "./logger.js";
const { snakeCase } = lodash;
export function signJwt(
  object: object | string | Buffer,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  log.info(
    `signingKey enviroment: ${
      process.env[`${snakeCase(keyName).toUpperCase()}`] as string
    }`
  );
  const signingKey = Buffer.from(
    process.env[`${snakeCase(keyName).toUpperCase()}`] as string,
    "base64"
  ).toString("ascii");
  log.info(`signingKey: ${signingKey}`);
  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt<T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null {
  const publicKey = Buffer.from(
    process.env[`${snakeCase(keyName).toUpperCase()}`] as string,
    "base64"
  ).toString("ascii");
  log.info(`publicKey: ${publicKey}`);
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as T;
    return decoded;
  } catch (e) {
    log.info(`error accrued because: ${e}`);

    return null;
  }
}
