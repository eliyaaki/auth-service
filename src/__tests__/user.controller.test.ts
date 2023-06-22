import { Request, Response } from "express";
import log from "../utils/logger";
import {
  createUser,
  verifyUser,
  forgottenPassword,
  resetPassword,
  getAllUsers,
  findUserByEmail,
} from "../service/user.service";
import { getUserResponseDto } from "../converter/appConverter";
import * as userController from "../controller/user.controller";
import InternalServerError from "../exceptions/InternalServerError";
import NotFoundError from "../exceptions/NotFoundError";

jest.mock("../service/user.service");
jest.mock("../converter/appConverter");
jest.mock("../utils/logger");

describe("user.controller", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;
  });

  describe("getAllUsersController", () => {
    it("should get all users and return their DTOs", async () => {
      // Mocking
      const allUsers = [
        { id: "1", name: "User 1" },
        { id: "2", name: "User 2" },
      ];
      const allUserDtos = [
        { id: "1", name: "User 1 DTO" },
        { id: "2", name: "User 2 DTO" },
      ];
      (getAllUsers as jest.Mock).mockResolvedValue(allUsers);
      (getUserResponseDto as jest.Mock).mockImplementation((user) =>
        allUserDtos.find((dto) => dto.id === user.id)
      );

      // Call the getAllUsersController function
      //@ts-ignore
      await userController.getAllUsersController(req, res);

      // Assertions
      expect(getAllUsers).toHaveBeenCalled();
      expect(getUserResponseDto).toHaveBeenCalledTimes(allUsers.length);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        users: allUserDtos,
      });
    });

    it("should handle any error if something went wrong", async () => {
      // Mocking
      const errorMessage = "something went wrong";
      (getAllUsers as jest.Mock).mockRejectedValue(new Error(errorMessage));

      // Call the getAllUsersController function
      //@ts-ignore
      await userController.getAllUsersController(req, res);

      // Assertions
      expect(getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "something went wrong",
      });
    });

    it("should handle the error thrown by getAllUsers function", async () => {
      // Mocking
      const errorMessage = "Users not found";
      (getAllUsers as jest.Mock).mockRejectedValue(
        new NotFoundError(errorMessage)
      );

      // Call the getAllUsersController function
      //@ts-ignore
      await userController.getAllUsersController(req, res);

      // Assertions
      expect(getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Users not found",
      });
    });
  });

  describe("getUserByEmailController", () => {
    it("should get a user by email and return its DTO", async () => {
      // Mocking
      const email = "test@example.com";
      const user = { id: "1", name: "User" };
      const userDto = { id: "1", name: "User DTO" };
      (findUserByEmail as jest.Mock).mockResolvedValue(user);
      (getUserResponseDto as jest.Mock).mockReturnValue(userDto);
      req.params = { email };

      // Call the getUserByEmailController function
      //@ts-ignore
      await userController.getUserByEmailController(req, res);

      // Assertions
      expect(findUserByEmail).toHaveBeenCalledWith(email);
      expect(getUserResponseDto).toHaveBeenCalledWith(user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 200, user: userDto });
    });
  });

  describe("createUserController", () => {
    it("should create a user and return the created user", async () => {
      // Mocking
      const createUserInput = { name: "John Doe" };
      const createdUser = { id: "1", name: "John Doe" };
      (createUser as jest.Mock).mockResolvedValue(createdUser);
      req.body = createUserInput;

      // Call the createUserController function
      //@ts-ignore
      await userController.createUserController(req, res);

      // Assertions
      expect(createUser).toHaveBeenCalledWith(createUserInput);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ status: 201, user: createdUser });
    });

    it("should handle an internal server error thrown by createUser function", async () => {
      // Mocking
      const createUserInput = { name: "John Doe" };
      const errorMessage = "Error occurred while creating a user";
      (createUser as jest.Mock).mockRejectedValue(
        new InternalServerError(errorMessage)
      );
      req.body = createUserInput;

      // Call the createUserController function
      //@ts-ignore
      await userController.createUserController(req, res);

      // Assertions
      expect(createUser).toHaveBeenCalledWith(createUserInput);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });
    });
  });

  describe("verifyUserController", () => {
    it("should verify a user and return a success message", async () => {
      // Mocking
      const id = "1";
      const verificationCode = "123456";
      req.params = { id, verificationCode };

      // Call the verifyUserController function
      //@ts-ignore
      await userController.verifyUserController(req, res);

      // Assertions
      expect(verifyUser).toHaveBeenCalledWith(id, verificationCode);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("user verified successfully");
    });

    it("should handle the validation error thrown by verifyUser function", async () => {
      // Mocking
      const id = "1";
      const verificationCode = "123456";
      const errorMessage = "Validation error";
      const validationError = new Error(errorMessage);
      validationError.name = "ValidationError";
      (verifyUser as jest.Mock).mockRejectedValue(validationError);
      req.params = { id, verificationCode };

      // Call the verifyUserController function
      //@ts-ignore
      await userController.verifyUserController(req, res);

      // Assertions
      expect(verifyUser).toHaveBeenCalledWith(id, verificationCode);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should handle other errors thrown by verifyUser function and throws 400", async () => {
      // Mocking
      const id = "1";
      const verificationCode = "123456";
      const errorMessage = "Internal Server Error";
      //@ts-ignore
      (verifyUser as jest.Mock).mockRejectedValue(new Error(errorMessage));
      req.params = { id, verificationCode };

      // Call the verifyUserController function
      //@ts-ignore
      await userController.verifyUserController(req, res);

      // Assertions
      expect(verifyUser).toHaveBeenCalledWith(id, verificationCode);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: errorMessage,
      });
    });

    it("should handle internal server error thrown by verifyUser function and throws 500", async () => {
      // Mocking
      const id = "1";
      const verificationCode = "123456";
      const errorMessage = "Internal Server Error";
      //@ts-ignore
      (verifyUser as jest.Mock).mockRejectedValue(
        new InternalServerError(errorMessage)
      );
      req.params = { id, verificationCode };

      // Call the verifyUserController function
      //@ts-ignore
      await userController.verifyUserController(req, res);

      // Assertions
      expect(verifyUser).toHaveBeenCalledWith(id, verificationCode);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: errorMessage,
      });
    });
  });
});
