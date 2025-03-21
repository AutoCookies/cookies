import cloudinary from "../config/cloudinary.js"; // Cấu hình Cloudinary
import streamifier from "streamifier";

/**
 * Upload hình ảnh lên Cloudinary
 * @param {Buffer} imageBuffer - Ảnh dạng Buffer
 * @param {string} imageMimetype - Loại ảnh (image/png, image/jpeg, ...)
 * @returns {Promise<string>} - URL của ảnh sau khi upload
 */
export const uploadImageService = async (imageBuffer) => {
    if (!imageBuffer) throw new Error("Không có ảnh để upload!");

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "posts" }, 
            (error, result) => {
                if (error) {
                    console.error("Lỗi upload ảnh:", error);
                    reject(error);
                } else {
                    console.log("Upload thành công:", result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(imageBuffer);
    });
};
