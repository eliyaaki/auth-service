import * as userService from "../service/user.service";
import * as appConverter from "../converter/appConverter";
import * as jwtUtils from "../utils/jwt";
import * as authService from "../service/auth.service";
import UserModel, { User } from "../model/user.model";
import { DocumentType } from "@typegoose/typegoose";
import SessionModel, { Session } from "../model/session.model";

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
const mockSession: Partial<DocumentType<Session>> = {
  _id: "153464363",
};

jest.mock("../service/user.service", () => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
}));

jest.mock("../converter/appConverter", () => ({
  getUserResponseDto: jest.fn(),
}));
jest.mock("../utils/jwt");
jest.mock("../model/session.model");

describe("authService", () => {
  describe("authenticateUser", () => {
    it("should authenticate if the user is verified and email and password are valid", async () => {
      // Mocking
      const email = "test@example.com";
      const password = "password";
      const user = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(true),
        verified: true,
      };
      const findUserByEmailSpy = jest.spyOn(userService, "findUserByEmail");

      //@ts-ignore
      findUserByEmailSpy.mockResolvedValue(user);
      //@ts-ignore
      jest.spyOn(SessionModel, "create").mockResolvedValueOnce(mockSession);
      const getUserResponseDtoSpy = jest.spyOn(
        appConverter,
        "getUserResponseDto"
      );
      getUserResponseDtoSpy.mockReturnValue(userToJSON);

      const getSignJwtSpy = jest.spyOn(jwtUtils, "signJwt");
      getSignJwtSpy.mockReturnValue("userToJSON");

      // Call the function
      const result = await authService.authenticateUser(email, password);

      // Perform assertions
      expect(findUserByEmailSpy).toHaveBeenCalledWith(email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
    it("should throw an error for an invalid email", async () => {
      // Mock user and user service functions
      jest.spyOn(userService, "findUserByEmail").mockResolvedValue(null);

      // Call the function being tested and assert the error
      await expect(
        authService.authenticateUser("test@example.com", "password")
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw an error if the user is not verified", async () => {
      // Mock user and user service functions
      const user = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      //@ts-ignore
      jest.spyOn(userService, "findUserByEmail").mockResolvedValue(user);

      // Call the function being tested and assert the error
      await expect(
        authService.authenticateUser("test@example.com", "password")
      ).rejects.toThrow("Please verify your email");
    });

    it("should throw an error if the password is invalid", async () => {
      const user = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      //@ts-ignore
      jest.spyOn(userService, "findUserByEmail").mockResolvedValue(user);
      //   jest.spyOn(mockUser, "validatePassword").mockResolvedValue(false);

      // Call the function being tested and assert the error
      await expect(
        authService.authenticateUser("test@example.com", "password")
      ).rejects.toThrow("Invalid email or password");
    });

    // Add more test cases for different scenarios
  });

  describe("refreshAccessToken", () => {
    it("should refreshAccessToken if the user is verified and email and password are valid", async () => {
      // Mocking
      // Mocking
      const refreshToken = "dummy_refresh_token";
      const decodedToken = { session: "dummy_session_id" };
      const mockSessionInternal = { user: "dummy_user_id", valid: true };
      const mockUser = { _id: "dummy_user_id" };
      const accessToken = "dummy_access_token";

      // Mock the verifyJwt function to return the decoded token
      jest.spyOn(jwtUtils, "verifyJwt").mockReturnValue(decodedToken);
      //@ts-ignore
      jest
        .spyOn(SessionModel, "findById")
        .mockResolvedValueOnce(mockSessionInternal);

      // Mock the findUserById function to return the mock user
      //@ts-ignore
      const findUserByIdSpy = jest
        .spyOn(userService, "findUserById")
        //@ts-ignore
        .mockResolvedValue(mockUser);
      const getUserResponseDtoSpy = jest.spyOn(
        appConverter,
        "getUserResponseDto"
      );
      getUserResponseDtoSpy.mockReturnValue(userToJSON);

      const getSignJwtSpy = jest.spyOn(jwtUtils, "signJwt");
      getSignJwtSpy.mockReturnValue("userToJSON");

      // Call the function
      const result = await authService.refreshAccessToken(accessToken);

      // Perform assertions
      expect(findUserByIdSpy).toHaveBeenCalledWith(mockUser._id);
      expect(result).toBeDefined();
    });

    it("should throw an error if the refresh token is invalid", async () => {
      // Mock verifyJwt to return null
      //@ts-ignore
      jest.spyOn(jwtUtils, "verifyJwt").mockReturnValue(null);

      // Call the function being tested and assert the error
      await expect(
        authService.refreshAccessToken("invalid-token")
      ).rejects.toThrow("Could not refresh access token");
    });

    it("should throw an error if the session is not found", async () => {
      // Mock findSessionById to return null
      jest.spyOn(authService, "findSessionById").mockResolvedValue(null);

      // Call the function being tested and assert the error
      await expect(
        authService.refreshAccessToken("valid-token")
      ).rejects.toThrow("Could not refresh access token");
    });

    it("should throw an error if the user is not found", async () => {
      // Mock findSessionById and findUserById to return null
      //@ts-ignore
      jest.spyOn(authService, "findSessionById").mockResolvedValue(mockUser);
      jest.spyOn(userService, "findUserById").mockResolvedValue(null);

      // Call the function being tested and assert the error
      await expect(
        authService.refreshAccessToken("valid-token")
      ).rejects.toThrow("Could not refresh access token");
    });
  });

  // Add more describe blocks and test cases for other functions in authService
});
