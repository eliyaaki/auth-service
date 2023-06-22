import nodemailer, { SendMailOptions } from "nodemailer";
import log from "./logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT!),
  logger: process.env.SMTP_LOGGER === "true",
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});
async function sendEmail(payload: SendMailOptions): Promise<void> {
  try {
    await transporter.sendMail(payload);
    log.info("Email sent successfully!");
  } catch (error) {
    log.error(
      `Error while sending mail to: ${payload.to}, is secure: ${
        process.env.SMTP_SECURE === "true"
      }, host: ${process.env.SMTP_HOST!}, user: ${process.env.SMTP_USER!}`
    );
  }
}
export default sendEmail;
