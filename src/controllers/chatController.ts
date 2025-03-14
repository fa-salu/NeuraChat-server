import { Request, Response } from "express";
import { CustomError } from "../utils/error/customError";
import { StandardResponse } from "../utils/stnadardResponse";
import Message from "../models/Message";
import Chat from "../models/Chat";

export const createChat = async (req: Request, res: Response) => {
  const { members, isGroup, name, admin } = req.body;

  if (!members || !members.length)
    throw new CustomError("Members are required", 400);

  const chat = await Chat.create({
    members,
    isGroup,
    name: isGroup ? name : undefined,
    admin: isGroup ? admin : undefined,
  });

  res
    .status(201)
    .json(new StandardResponse("message created successfully", chat));
};

export const getUserChats = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const chats = await Chat.find({ members: userId }).populate(
    "members",
    "name email"
  );
  res.status(200).json(new StandardResponse("Chats fetched", chats));
};

export const sendMessage = async (req: Request, res: Response) => {
  const { sender, chat, content, messageType } = req.body;

  const message = await Message.create({
    sender,
    chat,
    content,
    messageType,
  });

  res.status(201).json(new StandardResponse("Message sended", message));
};

export const getMessages = async (req: Request, res: Response) => {
  const chatId = req.params.chatId;
  const messages = await Message.find({ chat: chatId }).populate(
    "sender",
    "name email"
  );
  res.status(200).json(new StandardResponse("fetched messages", messages));
};

export const editMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { content } = req.body;

  const message = await Message.findByIdAndUpdate(
    messageId,
    { content, isEdited: true },
    { new: true }
  );
  res.status(200).json(new StandardResponse("Message edited", message));
};

export const deleteMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { userId } = req.body;

  const message = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { deletedFor: userId } },
    { new: true }
  );
  res
    .status(200)
    .json(new StandardResponse("Message deleted successfully", message));
};
