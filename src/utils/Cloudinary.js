import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ //Configure cloudinary using variables from .env
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => { //takes a string as path and saves it on cloudinary servers
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" //takes all types of files, .png, .jpg, .pdf etc
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // if error remomve file from our server
        return null;
    }
};

export { uploadOnCloudinary };