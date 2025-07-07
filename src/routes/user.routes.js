import { Router } from "express";
import { registerUser, loginUser, logOutUser, refreshAccessToken, changePassword, getUser, updateProfile, updateAvatar, updateCoverImage, getChannel, getWatchHistory } from "../controllers/user.controller.js";
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


router.route("/current-user").get(verifyJWT, getUser);


router.route("/update-account").patch(verifyJWT, updateProfile);


router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);


router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);


router.route("/c/:username").get(verifyJWT, getChannel);


router.route("/history").get(verifyJWT, getWatchHistory);

export default router;