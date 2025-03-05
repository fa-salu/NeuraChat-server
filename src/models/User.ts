import mongoose from "mongoose";

interface IEmailUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
}

const emailUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const EmailUser = mongoose.model<IEmailUser>("EmailUser", emailUserSchema);
export default EmailUser;
