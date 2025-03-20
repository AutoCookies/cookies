import cloudinary from "../config/cloudinary.js"; // Cấu hình Cloudinary
import streamifier from "streamifier";

/**
 * Upload hình ảnh lên Cloudinary
 * @param {Buffer} imageBuffer - Ảnh dạng Buffer
 * @param {string} imageMimetype - Loại ảnh (image/png, image/jpeg, ...)
 * @returns {Promise<string>} - URL của ảnh sau khi upload
 */
export const uploadImageService = (imageBuffer, imageMimetype) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "post_images", // Định danh thư mục trên Cloudinary
                resource_type: "image",
                format: imageMimetype.split("/")[1], // Lấy định dạng ảnh từ mimetype
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );

        streamifier.createReadStream(imageBuffer).pipe(uploadStream);
    });
};
