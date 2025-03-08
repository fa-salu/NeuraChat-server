import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { CustomRequest, JwtDecoded } from "../types/interfaces";
import { CustomError } from "../utils/error/customError";
import User from "../models/User";

export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      const authHeader = req.header("Authorization");
      const headerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      if (!headerToken) {
        throw new CustomError("Not authenticated", 401);
      }

      const verified = jwt.verify(
        headerToken,
        process.env.JWT_SECRET || ""
      ) as JwtDecoded;
      req.user = verified;
    } else {
      const verified = jwt.verify(
        token,
        process.env.JWT_SECRET || ""
      ) as JwtDecoded;
      req.user = verified;
    }

    const userExists = await User.findById(req.user.userId || req.user.id);
    if (!userExists) {
      throw new CustomError("User not found or blocked", 404);
    }

    if (userExists.isBlocked) {
      throw new CustomError("Your account has been blocked", 403);
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json({ success: false, message: "Token expired", tokenExpired: true });
    }
    next(error);
  }
};
