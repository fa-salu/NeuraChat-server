import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const EMAIL_USER = process.env.MAIL_USER;
const EMAIL_PASS = process.env.MAIL_PASS;

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
