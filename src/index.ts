import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "../config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
