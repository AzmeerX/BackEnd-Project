import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionObj = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`DB Connected.\nDB HOST: ${connectionObj.connection.host}`);
    } catch (error) {
        console.log("ERROR: ", error);
        process.exit(1);
    }
};

export default connectDB;