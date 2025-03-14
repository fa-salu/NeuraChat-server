import express from "express";
import {
  createChat,
  deleteMessage,
  editMessage,
  getUserChats,
  getMessages,
  sendMessage,
} from "../controllers/chatController";
import { errorCatch } from "../utils/error/errorCatch";

const router = express.Router();

router.post("/create", errorCatch(createChat));
router.get("/:userId", errorCatch(getUserChats));
router.post("/send", errorCatch(sendMessage));
router.get("/messages/:chatId", errorCatch(getMessages));
router.put("/edit/:messageId", errorCatch(editMessage));
router.delete("/delete/:messageId", errorCatch(deleteMessage));

export default router;
