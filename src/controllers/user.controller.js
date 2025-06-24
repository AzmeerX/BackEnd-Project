import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    const { fullname, email, username, password } = req.body;
    
    if(fullname === "") throw new ApiError(400, "Full name is required");
    if(username === "") throw new ApiError(400, "Username is required");
    if(password === "") throw new ApiError(400, "Password is required");
    if(email === "") throw new ApiError(400, "Email is required");

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(existingUser) throw new ApiError(400, "Username or Email already exists");

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let PfPLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        PfPLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) throw new ApiError(400, "Avatar is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(PfPLocalPath);

    if(!avatar) throw new ApiError(400, "Avatar file is required");

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

    if(!createdUser) throw new ApiError(500, "Something went wrong!");

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User Registered!")
    );
});

export { registerUser };