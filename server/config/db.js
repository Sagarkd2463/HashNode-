import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error("DB Connection Failed...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB Successfully Connected...");
};

export default connectToDB;