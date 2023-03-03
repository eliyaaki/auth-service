import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email address"),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password must be at least 6 characters"),
    passwordConfirmation: string({
      required_error: "PasswordConfirmation is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export const getUserByEmailSchema = object({
  params: object({
    email: string({
      required_error: "Email is required",
      invalid_type_error: "Invalid email",
    })
      .trim()
      .min(1, "email cant be empty")
      .email("Not a valid email address"),
  }),
});

export const verifyUserSchema = object({
  params: object({
    id: string(),
    verificationCode: string(),
  }),
});

export const forgottenPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email address"),
  }),
});
export const resetPasswordSchema = object({
  params: object({
    id: string(),
    passwordResetCode: string(),
  }),
  body: object({
    password: string({
      required_error: "Password is required",
    }).min(6, "Password must be at least 6 characters"),
    passwordConfirmation: string({
      required_error: "PasswordConfirmation is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];

export type VerifyUserInput = TypeOf<typeof verifyUserSchema>["params"];
export type GetUserByEmailInput = TypeOf<typeof getUserByEmailSchema>["params"];

export type ForgottenPasswordInput = TypeOf<
  typeof forgottenPasswordSchema
>["body"];

export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
