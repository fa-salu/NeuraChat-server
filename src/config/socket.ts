import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import Message from "../models/Message";
import { Types } from "mongoose";

interface MessageData {
  chat: string;
  sender: string;
  content: string;
  messageType: "text" | "image" | "video" | "file" | "audio";
}

export default function setupSocket(server: HttpServer): Server {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket: Socket) => {
    console.log("User Connected: ", socket.id);

    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId);
    });

    socket.on("send_message", async (data) => {
      try {
        // Validate if sender and chat are valid MongoDB ObjectIds
        if (!Types.ObjectId.isValid(data.sender)) {
          console.error("Invalid sender ID:", data.sender);
          return;
        }

        if (!Types.ObjectId.isValid(data.chat)) {
          console.error("Invalid chat ID:", data.chat);
          return;
        }

        const newMessage = new Message({
          chatId: new Types.ObjectId(data.chat), // Convert chat ID to ObjectId
          sender: new Types.ObjectId(data.sender), // Convert sender ID to ObjectId
          content: data.content,
          messageType: data.messageType || "text",
        });

        await newMessage.save();
        io.to(data.chat).emit("receive_message", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on(
      "delete_message",
      async (data: { chat: string; messageId: string }) => {
        try {
          await Message.findByIdAndDelete(data.messageId);

          io.to(data.chat).emit("message_deleted", {
            messageId: data.messageId,
          });
        } catch (error) {
          console.error("Error deleting message:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User Disconnected");
    });
  });

  return io;
}
