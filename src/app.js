import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({ //Set which IP's are allowed to send requests to this backend. * means all can
    origin: process.env.CORS_ORIGIN
}));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from './routes/user.routes.js';

app.use("/api/v1/users", userRouter);

export { app }