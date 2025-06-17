import dotenv from "dotenv"
import connectDB from "./DB/db.js";

dotenv.config({
    path: './env'
});

connectDB()
.then(() => {
    application.listen(process.env.PORT)
})
.catch((err) => {
    console.log("MongoDB connection failed");
});