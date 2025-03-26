import mongoose, { Schema, Document } from "mongoose";

interface IChat extends Document {
  name?: string;
  members: mongoose.Types.ObjectId[];
  isGroup: boolean;
  admin?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    name: { type: String, trim: true },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmailUser",
        required: true,
      },
    ],
    isGroup: { type: Boolean, default: false },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "EmailUser" },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", chatSchema);
