import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dotenv.config();

const connectDB = async () => { //use try catch and async await to prevent errors
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log(`DB Connected.\nDB HOST: ${connectionInstance.connection.host}`);
    return connectionInstance; 
  } catch (error) {
    console.error("Mongo connection error:", error);
    throw error;
  }
};

export default connectDB;