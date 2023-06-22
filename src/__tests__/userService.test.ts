import "dotenv/config";
import {
  createUser,
  forgottenPassword,
  resetPassword,
  verifyUser,
  findUserById,
} from "../service/user.service";
import UserModel, { User, privateFields } from "../model/user.model";
import * as sendEmail from "../utils/mailer";
import { DocumentType } from "@typegoose/typegoose";
import * as appConverter from "../converter/appConverter";

const userToJSON = {
  _id: "1",
  email: "eli@gmail.com",
  verified: false,
  verificationCode: "abc123",
};
const mockUser: Partial<DocumentType<User>> = {
  _id: "1",
  email: "eli@gmail.com",
  verified: false,
  verificationCode: "abc123",
  passwordResetCode: "123456",
  save: jest.fn().mockResolvedValue(undefined),
};

jest.mock("../model/user.model");
jest.mock("../utils/mailer");
jest.mock("../converter/appConverter");

describe("userService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const mockCreatedUser = { ...mockUser, toJSON: jest.fn() };
      const title = "Verification Email";
      const message = `${process.env.BASE_URL}/api/users/verify/${mockUser.id}/${mockUser.verificationCode}`;
      //@ts-ignore
      jest.spyOn(UserModel, "create").mockResolvedValueOnce(mockCreatedUser);
      const getUserResponseDtoSpy = jest.spyOn(
        appConverter,
        "getUserResponseDto"
      );
      getUserResponseDtoSpy.mockReturnValue(userToJSON);

      const result = await createUser(mockUser);

      expect(UserModel.create).toHaveBeenCalledWith(mockUser);
      expect(sendEmail.default).toHaveBeenCalledWith({
        from: expect.any(String),
        to: mockCreatedUser?.email,
        subject: title,
        text: message,
        html: expect.any(String),
      });
      expect(getUserResponseDtoSpy).toHaveBeenCalledWith(mockCreatedUser);
      expect(result).toEqual(userToJSON); // Use userToJSON directly as the expected result
    });

    it("should throw an error if user creation failed", async () => {
      //@ts-ignore
      jest.spyOn(UserModel, "create").mockResolvedValueOnce(null);

      await expect(createUser(mockUser)).rejects.toThrow("Error creating user");
      expect(UserModel.create).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("verifyUser", () => {
    it("should verify a user", async () => {
      const mockUserWithCode = {
        ...mockUser,
        verified: false,
        verificationCode: "1234",
      };
      const mockSavedUser = { ...mockUserWithCode, verified: true };
      jest.spyOn(UserModel, "findById").mockResolvedValueOnce(mockUserWithCode);
      //@ts-ignore
      jest.spyOn(mockUserWithCode, "save").mockResolvedValueOnce(mockSavedUser);

      await verifyUser("id", "1234");

      expect(UserModel.findById).toHaveBeenCalledWith("id");
      expect(mockUserWithCode.save).toHaveBeenCalledWith();
      expect(mockUserWithCode.verified).toBe(true);
    });

    it("should throw an error if the user is already verified", async () => {
      const mockUserVerified = { ...mockUser, verified: true };
      jest.spyOn(UserModel, "findById").mockResolvedValueOnce(mockUserVerified);

      await expect(verifyUser("id", "1234")).rejects.toThrow(
        "user is already verified"
      );
      expect(UserModel.findById).toHaveBeenCalledWith("id");
    });

    it("should throw an error if the verification code is incorrect", async () => {
      const mockUserWithCode = {
        ...mockUser,
        verified: false,
        verificationCode: "1234",
      };
      jest.spyOn(UserModel, "findById").mockResolvedValueOnce(mockUserWithCode);

      await expect(verifyUser("id", "wrong-code")).rejects.toThrow(
        "user verification failed"
      );
      expect(UserModel.findById).toHaveBeenCalledWith("id");
    });

    it("should throw an error if the user is not found", async () => {
      jest.spyOn(UserModel, "findById").mockResolvedValueOnce(null);

      await expect(verifyUser("id", "1234")).rejects.toThrow("User not found");
      expect(UserModel.findById).toHaveBeenCalledWith("id");
    });
  });

  describe("forgottenPassword", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if user is not found", async () => {
      jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(null);
      await expect(forgottenPassword("test@example.com")).rejects.toThrow(
        "if you registered with this email address you will receive an email for resetting the password"
      );
    });

    it("should throw an error if user is not verified", async () => {
      jest
        .spyOn(UserModel, "findOne")
        .mockResolvedValueOnce({ verified: false });
      await expect(forgottenPassword("test@example.com")).rejects.toThrow(
        "user not verified"
      );
    });

    it("should send an email if user is found and verified", async () => {
      mockUser.verified = true;
      jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(mockUser);
      const title = "Reset password";
      const message = `${process.env.BASE_URL}/api/users/resetPassword/${
        mockUser._id
      }/${expect.any(String)}`;
      await forgottenPassword(mockUser.email as string);
      expect(mockUser.save).toHaveBeenCalledTimes(1);
      expect(sendEmail.default).toHaveBeenCalledTimes(1);
      expect(sendEmail.default).toHaveBeenCalledWith({
        from: expect.any(String),
        to: mockUser?.email,
        subject: title,
        text: expect.any(String),
        html: expect.any(String),
      });
    });
  });

  describe("resetPassword", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if the user cannot be found", async () => {
      const findUserByIdMock = jest.spyOn(UserModel, "findById");
      findUserByIdMock.mockResolvedValueOnce(null);

      await expect(resetPassword("123", "abc", "password")).rejects.toThrow(
        "couldn't reset password"
      );

      expect(findUserByIdMock).toHaveBeenCalledWith("123");
    });

    it("should throw an error if the user has no password reset code", async () => {
      mockUser.passwordResetCode = null;
      //@ts-ignore
      const findUserByIdMock = jest.spyOn(UserModel, "findById");

      //@ts-ignore
      findUserByIdMock.mockResolvedValueOnce(mockUser);

      await expect(resetPassword("123", "abc", "password")).rejects.toThrow(
        "couldn't reset password"
      );

      expect(findUserByIdMock).toHaveBeenCalledWith("123");
    });

    it("should throw an error if the password reset code does not match", async () => {
      mockUser.passwordResetCode = null;
      const findUserByIdMock = jest.spyOn(UserModel, "findById");
      //@ts-ignore
      findUserByIdMock.mockResolvedValue(mockUser);

      await expect(resetPassword("123", "abc", "password")).rejects.toThrow(
        "couldn't reset password"
      );

      expect(findUserByIdMock).toHaveBeenCalledWith("123");
    });

    it("should reset the user password and save the user", async () => {
      mockUser.passwordResetCode = "abc";
      const findUserByIdMock = jest.spyOn(UserModel, "findById");
      //@ts-ignore
      findUserByIdMock.mockResolvedValue(mockUser);

      await resetPassword("123", "abc", "newpassword");

      expect(findUserByIdMock).toHaveBeenCalledWith("123");
      expect(mockUser.passwordResetCode).toBeNull();
      expect(mockUser.password).toBe("newpassword");
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe("findUserById", () => {
    it("should return null if no user is found", async () => {
      const findByIdMock = jest.spyOn(UserModel, "findById");
      findByIdMock.mockResolvedValue(null);

      const result = await findUserById("123");

      expect(findByIdMock).toHaveBeenCalledWith("123");
      expect(result).toBeNull();
    });

    it("should return the user if one is found", async () => {
      const findByIdMock = jest.spyOn(UserModel, "findById");
      findByIdMock.mockResolvedValue(mockUser);

      const result = await findUserById("123");

      expect(findByIdMock).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockUser);
    });
  });
});
