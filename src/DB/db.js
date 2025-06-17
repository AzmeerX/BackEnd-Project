import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dotenv.config();

const connectDB = async () => {
    try {
        console.log("🔗 Connecting to:", `${process.env.MONGODB_URL}/${DB_NAME}`);
        const connectionObj = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`DB Connected.\nDB HOST: ${connectionObj.connection.host}`);
    } catch (error) {
        console.log("ERROR: ", error);
        process.exit(1);
    }
};

export default connectDB;