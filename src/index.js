import dotenv from "dotenv" // Since we are using modules not commonjs, we need to configure it in package.json as experimental tool
dotenv.config();

import connectDB from "./DB/db.js";
import { app } from './app.js'

connectDB()
.then(() => { //If database is successfully connected then start listening by the app imported from app.js
    app.listen(process.env.PORT)
    console.log("Server listening at:" , process.env.PORT);
})
.catch((err) => {
    console.log("MongoDB connection failed");
});