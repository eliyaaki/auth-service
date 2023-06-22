import lodash from "lodash";
const { omit } = lodash;
import { DocumentType } from "@typegoose/typegoose";
import { nanoid } from "nanoid";
import UserModel, { privateFields, User } from "../model/user.model";
import log from "../utils/logger";
import sendEmail from "../utils/mailer";
import { getUserResponseDto } from "../converter/appConverter";

import NotFoundError from "../exceptions/NotFoundError";
import InternalServerError from "../exceptions/InternalServerError";
export async function getAllUsers() {
  const allUsers = UserModel.find({});
  if (!allUsers) throw new NotFoundError("Users not found");
  return allUsers;
}

export async function createUser(input: Partial<User>) {
  const user = await UserModel.create(input);
  if (!user) {
    log.debug("couldn't create user with this email address");
    throw new InternalServerError("Error creating user");
  }
  const subject = "Verification Email";
  const message = `${process.env.BASE_URL}/api/users/verify/${user.id}/${user.verificationCode}`;
  log.info(`subject: ${subject}, message: ${message}`);
  await sendingEmail(
    user?.email,
    subject,
    message,
    createVerificationHtml(message, subject)
  );
  const userResponseDto = getUserResponseDto(user);
  return userResponseDto;
}

export async function verifyUser(id: string, verificationCode: string) {
  const user = await findUserById(id);
  if (!user) throw new NotFoundError("User not found");
  if (user.verified) throw Error("user is already verified");

  if (user?.verificationCode !== verificationCode)
    throw Error("user verification failed");

  try {
    user.verified = true;
    await user.save();
  } catch (error) {
    throw new InternalServerError("user verification failed");
  }
}

export async function forgottenPassword(email: string) {
  var user = await findUserByEmail(email);
  if (!user) {
    log.debug("couldn't find user with this email address");
    throw Error(
      "if you registered with this email address you will receive an email for resetting the password"
    );
  }
  if (!user.verified) {
    throw Error("user not verified");
  }
  try {
    user.passwordResetCode = await generatePasswordResetCode();
    user.save();
  } catch (error) {
    throw new InternalServerError("couldn't generate reset password code");
  }
  const subject = "Reset password";
  const message = `${process.env.BASE_URL}/api/users/resetPassword/${user._id}/${user.passwordResetCode}`;
  log.info(`subject: ${subject}, message: ${message}`);

  await sendingEmail(
    user?.email,
    subject,
    message,
    createResetPasswordHtml(message, subject)
  );
}

export async function resetPassword(
  id: string,
  passwordResetCode: string,
  password: string
) {
  var user = await findUserById(id);
  if (
    !user ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  ) {
    throw Error("couldn't reset password");
  }

  try {
    user.passwordResetCode = null;
    user.password = password;
    await user.save();
  } catch (error) {
    throw new InternalServerError("couldn't reset password");
  }
}

export async function findUserById(id: string) {
  try {
    return UserModel.findById(id);
  } catch (error) {
    throw new NotFoundError("User not found");
  }
}
export async function findUserByEmail(email: string) {
  try {
    return UserModel.findOne({ email });
  } catch (error) {
    throw new NotFoundError("User not found");
  }
}
async function generatePasswordResetCode() {
  const resetCode = nanoid();
  return resetCode;
}
async function sendingEmail(
  emailTo: string,
  subject: string,
  text: string,
  html: string
) {
  try {
    sendEmail({
      from: process.env.SMTP_USER!,
      to: emailTo,
      subject,
      text,
      html,
    });
  } catch (error) {
    throw new InternalServerError("Error sending email");
  }
}

function createResetPasswordHtml(text: string, subject: string) {
  return `
  <!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Password Reset</title>
	<style>
		body {
			background-color: #f2f2f2;
			font-family: Arial, sans-serif;
		}

		form {
			background-color: white;
			padding: 20px;
			border-radius: 5px;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
			max-width: 400px;
			margin: 50px auto;
		}

		h2 {
			margin-top: 0;
			color: #333;
		}

		input[type="password"] {
			width: 100%;
			padding: 12px 20px;
			margin: 8px 0;
			display: inline-block;
			border: 1px solid #ccc;
			border-radius: 4px;
			box-sizing: border-box;
		}

		input[type="submit"] {
			background-color: #4CAF50;
			color: white;
			padding: 12px 20px;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			width: 100%;
			font-size: 16px;
			margin-top: 10px;
		}

		input[type="submit"]:hover {
			background-color: #45a049;
		}

		label {
			display: block;
			color: #333;
			font-size: 16px;
			margin-bottom: 10px;
		}

		.error {
			color: red;
			font-size: 14px;
			margin-top: 5px;
		}
	</style>
</head>
<body>
	<form action=${text} method="post">
		<h2>Reset Password</h2>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
		<label for="password">New Password</label>
		<input type="password" id="password" name="password" required>

		<label for="passwordConfirmation">Confirm Password</label>
		<input type="password" id="passwordConfirmation" name="passwordConfirmation" required>

		<input type="submit" value="Reset Password">
	</form>
</body>
</html>

  `;
}

export function createVerificationHtml(text: string, subject: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Password Reset Form</title>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f6f6f6;
        }
        .container {
          margin: 0 auto;
          max-width: 500px;
          background-color: #fff;
          padding: 30px;
          margin-top: 50px;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
          border-radius: 5px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 10px;
          font-weight: bold;
        }
        input {
          display: block;
          width: 100%;
          padding: 10px;
          font-size: 16px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        button {
          display: block;
          background-color: #008CBA;
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
        }
        button:hover {
          background-color: #3e8e41;
        }
        .error-message {
          color: red;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${subject}:</h2>
        <form method="post" action=${text}>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" name="email" id="email" required />
            <span class="error-message"></span>
          </div>
          <button type="submit">Verify</button>
        </form>
      </div>
    </body>
  </html>
  `;
}
