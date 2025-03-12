import express from "express";
import {
  registerWithEmail,
  verifyEmailOtp,
  login,
  resendOtp,
  refreshToken,
  logout,
  getUser,
} from "../controllers/authController";
import { errorCatch } from "../utils/error/errorCatch";
import { validateData } from "../middleware/zodValidation";
import {
  loginSchema,
  otpSchema,
  registerSchema,
  resendOtpSchema,
} from "../utils/zodSchemas";

const router = express.Router();

router.post(
  "/sendotp",
  validateData(registerSchema),
  errorCatch(registerWithEmail)
);
router.post("/validate", validateData(otpSchema), errorCatch(verifyEmailOtp));
router.post("/login", validateData(loginSchema), errorCatch(login));
router.post("/resentotp", validateData(resendOtpSchema), errorCatch(resendOtp));
router.post("/refresh", errorCatch(refreshToken));
router.post("/logout", errorCatch(logout));
router.get("/me", errorCatch(getUser));

export default router;
