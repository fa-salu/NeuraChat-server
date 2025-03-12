import { z } from "zod";

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(4),
  image: z.string().optional(),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
});

const resendOtpSchema = z.object({
  email: z.string().email(),
});

export { loginSchema, registerSchema, otpSchema, resendOtpSchema };
