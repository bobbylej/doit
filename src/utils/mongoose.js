import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

export const connectDB = () => mongoose.connect(process.env.MONGODB_URL, {
  dbName: process.env.MONGODB_DBNAME
});