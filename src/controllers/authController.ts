import { Request, Response } from "express";
import EmailUser from "../models/User";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/error/stnadardResponse";
import { generateOTP, transporter } from "../services/emailAuthService";

dotenv.config();

export const registerWithEmail = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await EmailUser.findOne({ email });
  if (existingUser) throw new CustomError("Email registerd, Please login", 400);

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);

  const user = await EmailUser.create({
    name,
    email,
    password: hashedPassword,
    otp,
    otpExpiry,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Email Verification</h2>
        <p>Hello,</p>
        <p>Thank you for registering. Please use the following verification code:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
          <h1 style="color: #2c7be5; font-size: 32px; letter-spacing: 6px; margin: 0;">${otp}</h1>
          <p style="color: #777; margin-top: 10px; font-size: 14px;">This code will expire in ${
            process.env.OTP_EXPIRY || 5
          } minutes</p>
        </div>
        <p>If you did not request this verification, please ignore this email.</p>
        <p>Best regards,<br>The Support Team</p>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #777;">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `,
  });

  const response = {
    email,
    otp,
    otpExpiry,
  };

  res
    .status(201)
    .json(
      new StandardResponse(
        "User registered successfully. OTP sent to email.",
        response
      )
    );
};

export const verifyEmailOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await EmailUser.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);
  if (user.isVerified) throw new CustomError("User already verified", 400);
  if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < new Date()))
    throw new CustomError("Invalid or expired OTP", 400);

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || "",
    { expiresIn: "7d" }
  );

  const response = {
    token,
    user,
  };

  res
    .status(200)
    .json(new StandardResponse("Email verified successfully", response));
};

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await EmailUser.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);
  if (user.isVerified) throw new CustomError("User already verified", 400);

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Resend Verification OTP",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">Resend OTP</h2>
          <p>Hello,</p>
          <p>Here is your new verification code:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
            <h1 style="color: #2c7be5; font-size: 32px; letter-spacing: 6px; margin: 0;">${otp}</h1>
            <p style="color: #777; margin-top: 10px; font-size: 14px;">This code will expire in 5 minutes</p>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br>The Support Team</p>
        </div>
      `,
  });

  res
    .status(200)
    .json(new StandardResponse("OTP resent successfully. Check your email."));
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await EmailUser.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new CustomError("Invalid password", 400);

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || "",
    { expiresIn: "7d" }
  );

  const response = {
    token,
    user,
  };

  res.status(200).json(new StandardResponse("Login successful", response));
};
