import nodemailer, { SendMailOptions } from "nodemailer";
import log from "./logger.js";

interface EmailCredentials {
  user: string;
  pass: string;
  host: string;
  port: number;
  secure?: boolean;
  logger?: boolean;
}

async function createTestCredentials() {
  const credentials = await nodemailer.createTestAccount();
  log.info(`Creating test credentials :${credentials}`);

  return credentials;
}

// const smtp = config.get<EmailCredentials>("emailConfig");
// const smpt = config.smtp;
// const testCredentials = await createTestCredentials();

// SMTP_USER="a3bf3c834faa38"
// SMTP_PASS="1286f47779ea08"
// SMTP_HOST="sandbox.smtp.mailtrap.io"
// SMTP_PORT=2525
// SMTP_SECURE=false
const emailCredentials: EmailCredentials = {
  user: process.env.SMTP_USER!,
  pass: process.env.SMTP_PASS!,
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  secure: process.env.SMTP_SECURE === "true",
  logger: process.env.SMTP_LOGGER === "true",
};

// const smpt = emailCredentials;
const transporter = nodemailer.createTransport({
  ...emailCredentials,
  auth: { user: emailCredentials.user, pass: emailCredentials.pass },
});

async function sendEmail(payload: SendMailOptions): Promise<void> {
  transporter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(
        `${err} accrued while sending email and emailCredentials: ${emailCredentials.port}`
      );
      log.error(
        ` port: ${emailCredentials.port}, userName: ${emailCredentials.user}, host: ${emailCredentials.host}, pass: ${emailCredentials.pass}, `
      );
    }
    // log.info(`Preview URL :${nodemailer.getTestMessageUrl(info)}`);
    log.info(
      ` port: ${emailCredentials.port}, userName: ${emailCredentials.user}, host: ${emailCredentials.host}, pass: ${emailCredentials.pass}, `
    );
  });
}

export default sendEmail;
