import { Request, Response } from "express";
import EmailUser from "../models/User";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/stnadardResponse";
import { generateOTP, transporter } from "../services/emailAuthService";
import { generateTokens, setTokenCookies } from "../services/tokenService";
import {
  generateResendOtpEmail,
  generateVerificationEmail,
} from "../utils/emailTemplates";

dotenv.config();

export const getUser = async (req: Request, res: Response) => {
  const token = req.cookies.accessToken;
  if (!token) throw new CustomError("Unauthorized", 401);

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "");
  const user = await EmailUser.findById(decoded.userId).select(
    "-password -refreshToken"
  );

  if (!user) throw new CustomError("User not found", 404);

  res.status(200).json(new StandardResponse("User details fetched", { user }));
};

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
    html: generateVerificationEmail(otp),
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

  const { accessToken, refreshToken } = generateTokens(user);

  setTokenCookies(res, accessToken, refreshToken);

  const response = {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
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
    html: generateResendOtpEmail(otp),
  });

  res
    .status(200)
    .json(new StandardResponse("OTP resent successfully. Check your email."));
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await EmailUser.findOne({ email });
  if (!user) throw new CustomError("User not found", 404);
  if (!user.isVerified) throw new CustomError("Email not verified", 401);

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new CustomError("Invalid password", 400);

  const { accessToken, refreshToken } = generateTokens(user);

  setTokenCookies(res, accessToken, refreshToken);

  const response = {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
  };

  res.status(200).json(new StandardResponse("Login successful", response));
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  console.log("re", refreshToken);

  if (!refreshToken) {
    throw new CustomError("Refresh token not found", 401);
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET || ""
  ) as jwt.JwtPayload;

  const user = await EmailUser.findById(decoded.userId);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const tokens = generateTokens(user);

  setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

  res
    .status(200)
    .json(new StandardResponse("Token refreshed successfully", {}));
};

export const logout = async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  if (accessToken) {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET || ""
    ) as jwt.JwtPayload;

    // const user = await EmailUser.findById(decoded.userId);
    // if (user) {
    //   user.refreshToken = undefined;
    //   await user.save();
    // }
  }

  res.cookie("accessToken", "", { maxAge: 0 });
  res.cookie("refreshToken", "", { maxAge: 0, path: "/api/auth/refresh" });

  res.status(200).json(new StandardResponse("Logged out successfully", {}));
};
