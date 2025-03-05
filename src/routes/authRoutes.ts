import express from "express";
import {
  registerWithEmail,
  verifyEmailOtp,
  login,
} from "../controllers/authController";
import { errorCatch } from "../utils/error/errorCatch";

const router = express.Router();

router.post("/sendotp", errorCatch(registerWithEmail));
router.post("/validate", errorCatch(verifyEmailOtp));
router.post("/login", errorCatch(login));

export default router;
