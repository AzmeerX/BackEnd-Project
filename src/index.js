import dotenv from "dotenv"
dotenv.config();

import connectDB from "./DB/db.js";
import { app } from './app.js'

connectDB()
.then(() => {
    app.listen(process.env.PORT)
    console.log("Server listening at:" , process.env.PORT);
})
.catch((err) => {
    console.log("MongoDB connection failed");
});