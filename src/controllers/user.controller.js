import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if (fullname === "") throw new ApiError(400, "Full name is required");
    if (username === "") throw new ApiError(400, "Username is required");
    if (password === "") throw new ApiError(400, "Password is required");
    if (email === "") throw new ApiError(400, "Email is required");

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) throw new ApiError(400, "Username or Email already exists");

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let PfPLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        PfPLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(PfPLocalPath);

    if (!avatar) throw new ApiError(400, "Avatar file is required");

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) throw new ApiError(500, "Something went wrong!");

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User Registered!")
    );
});


const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) throw new ApiError(400, "Username and Email are required");

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) throw new ApiError(400, "User does not exist");

    const isPasswordVaild = await user.isPasswordCorrect(password);

    if (!isPasswordVaild) throw new ApiError(400, "Incorrect Password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Log In Successfull!"));
});


const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "Logged Out"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) throw new ApiError(400, "Invalid Token");
    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(400, "Invalid Token");

    if (token !== user?.refreshToken) throw new ApiError(400, "Refresh Token Expired");

    const options = {
        httpOnly: true,
        secure: true
    }

    const { accessToken, newRefreshToken } = await user.generateAccessAndRefreshTokens(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed"));
});


const changePassword = asyncHandler(async (req, res) => {
    const { password, newPassword } = req.body;

    if (!newPassword) throw new ApiError(400, "Password is required");

    const user = await User.findById(req.user._id);
    const isPasswordVaild = user.isPasswordCorrect(password);

    if (!isPasswordVaild) throw new ApiError(400, "Incorrect Password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200)
        .json(new ApiResponse(200, user, "Password Changed Successfully"));
});


const getUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiResponse(200, req.user, "User Fetched"));
});


const updateProfile = asyncHandler(async (req, res) => {
    const { username, email, fullname } = req.body;

    if (!username || !email || !fullname) throw new ApiError(400, "All details required");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                username,
                email,
                fullname
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    if (!user) throw new ApiError(500, "Something went wrong");

    return res.status(200)
        .json(new ApiResponse(200, user, "User Updated"));
});


const updateAvatar = asyncHandler(async (req, res) => {
    const avatarFile = req.file.avatar.path;
    if (!avatarFile) throw new ApiError(400, "Avatar is required");

    const avatar = await uploadOnCloudinary(avatarFile);
    if (!avatar) throw new ApiError(500, "Error while uploading");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    if (!user) throw new ApiError(500, "Something went wrong");

    return res.status(200)
        .json(new ApiResponse(200, user, "Avatar Changed Successfully"));
});


const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageFile = req.file.coverImage.path;
    if (!coverImageFile) throw new ApiError(400, "Image is required");

    const coverImage = await uploadOnCloudinary(coverImageFile);
    if (!coverImage) throw new ApiError(500, "Error while uploading");

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    if (!user) throw new ApiError(500, "Something went wrong");

    return res.status(200)
        .json(new ApiResponse(200, user, "Profile Picture Changed Successfully"));
});


const getChannel = asyncHandler(async (req, res) => {
    const username = req.params;

    if (!username?.trim()) throw new ApiError(400, "Username is required");

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                email: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ]);

    if (!channel?.length) throw new ApiError(400, "Channel does not exist");

    return res.status(200)
        .json(new ApiResponse(200, channel[0], "User channel fetched"));
});


const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);

    return res.status(200)
        .json(new ApiResponse(200, user[0].watchHistory, "Watch History fetched"));
});


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changePassword,
    getUser,
    updateProfile,
    updateAvatar,
    updateCoverImage,
    getChannel,
    getWatchHistory
};