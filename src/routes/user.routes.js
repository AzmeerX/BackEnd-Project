import { Router } from "express";
import { registerUser, loginUser, logOutUser, refreshAccessToken, changePassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);


router.route("/logout").post(verifyJWT, logOutUser);


router.route("/refresh-token").post(refreshAccessToken);


router.route("/change-password").post(verifyJWT, changePassword);

export default router;