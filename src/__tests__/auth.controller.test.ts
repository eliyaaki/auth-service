import {
  createSessionController,
  refreshAccessTokenController,
} from "../controller/auth.controller";
import { authenticateUser, refreshAccessToken } from "../service/auth.service";
import NotFoundError from "../exceptions/NotFoundError";
import InternalServerError from "../exceptions/InternalServerError";

jest.mock("../service/auth.service");

describe("createSessionController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a session and return tokens if authentication is successful", async () => {
    // Mocking
    const req = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    };
    const tokens = {
      accessToken: "dummyAccessToken",
      refreshToken: "dummyRefreshToken",
    };
    //@ts-ignore
    authenticateUser.mockResolvedValue(tokens);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await createSessionController(req, res);

    // Expectations
    expect(authenticateUser).toHaveBeenCalledWith(
      "test@example.com",
      "password"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(tokens);
  });

  it("should return a 500 error if an InternalServerError occurs", async () => {
    // Mocking
    const req = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    };
    //@ts-ignore
    authenticateUser.mockRejectedValue(
      new InternalServerError("Internal Server Error")
    );

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await createSessionController(req, res);

    // Expectations
    expect(authenticateUser).toHaveBeenCalledWith(
      "test@example.com",
      "password"
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });

  it("should return a 404 error if a NotFoundError occurs", async () => {
    // Mocking
    const req = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    };
    //@ts-ignore
    authenticateUser.mockRejectedValue(new NotFoundError("User not found"));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await createSessionController(req, res);

    // Expectations
    expect(authenticateUser).toHaveBeenCalledWith(
      "test@example.com",
      "password"
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should return a 400 error for any other error", async () => {
    // Mocking
    const req = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    };
    //@ts-ignore
    authenticateUser.mockRejectedValue(new Error("Some error"));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await createSessionController(req, res);

    // Expectations
    expect(authenticateUser).toHaveBeenCalledWith(
      "test@example.com",
      "password"
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Some error" });
  });
});

describe("refreshAccessTokenController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should refresh the access token and return it if refresh token exists", async () => {
    // Mocking
    const req = {
      headers: {
        "x-refresh": "dummyRefreshToken",
      },
    };
    const accessToken = "dummyAccessToken";
    //@ts-ignore
    refreshAccessToken.mockResolvedValue(accessToken);

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await refreshAccessTokenController(req, res);

    // Expectations
    expect(refreshAccessToken).toHaveBeenCalledWith("dummyRefreshToken");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ accessToken });
  });

  it("should return a 401 error if the refresh token is undefined", async () => {
    // Mocking
    const req = {
      headers: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await refreshAccessTokenController(req, res);

    // Expectations
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 401,
      message: "Refresh token doesn't exist at all",
    });
  });

  it("should return a 500 error if an InternalServerError occurs", async () => {
    // Mocking
    const req = {
      headers: {
        "x-refresh": "dummyRefreshToken",
      },
    };
    //@ts-ignore
    refreshAccessToken.mockRejectedValue(
      new InternalServerError("Internal Server Error")
    );

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await refreshAccessTokenController(req, res);

    // Expectations
    expect(refreshAccessToken).toHaveBeenCalledWith("dummyRefreshToken");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });

  it("should return a 404 error if a NotFoundError occurs", async () => {
    // Mocking
    const req = {
      headers: {
        "x-refresh": "dummyRefreshToken",
      },
    };
    //@ts-ignore
    refreshAccessToken.mockRejectedValue(
      new NotFoundError("Refresh token not found")
    );

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await refreshAccessTokenController(req, res);

    // Expectations
    expect(refreshAccessToken).toHaveBeenCalledWith("dummyRefreshToken");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Refresh token not found" });
  });

  it("should return a 400 error for any other error", async () => {
    // Mocking
    const req = {
      headers: {
        "x-refresh": "dummyRefreshToken",
      },
    };
    //@ts-ignore
    refreshAccessToken.mockRejectedValue(new Error("Some error"));

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Call the controller
    //@ts-ignore
    await refreshAccessTokenController(req, res);

    // Expectations
    expect(refreshAccessToken).toHaveBeenCalledWith("dummyRefreshToken");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Some error" });
  });
});
