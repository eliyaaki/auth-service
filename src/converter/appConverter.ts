import lodash from "lodash";
const { omit } = lodash;
import { DocumentType } from "@typegoose/typegoose";
import { privateFields, User } from "../model/user.model";
import log from "../utils/logger";

const InternalServerError = require("../exceptions/InternalServerError");
export function getUserResponseDto(user: DocumentType<User>) {
  try {
    const UserResponseDto = omit(user?.toJSON(), privateFields);
    log.info(`UserResponseDto: ${UserResponseDto}`);
    return UserResponseDto;
  } catch (error) {
    throw new InternalServerError("Error getting user response");
  }
}
