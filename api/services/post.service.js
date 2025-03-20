import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { uploadImageService } from "./upload.service.js";

/**
 * Tạo bài viết mới
 * @param {string} userId - ID của người đăng bài
 * @param {Object} data - Dữ liệu bài viết
 * @param {string} data.content - Nội dung bài viết
 * @param {Buffer} data.imageBuffer - Ảnh bài viết (dạng Buffer)
 * @param {string} data.imageMimetype - Loại ảnh (image/png, image/jpeg, ...)
 * @returns {Promise<Object>} - Bài viết đã tạo
 */
export const createPostService = async (userId, title, content, imageBuffer) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    if (!title || (!content && !imageBuffer)) {
        throw new Error("Bài đăng phải có tiêu đề và ít nhất nội dung hoặc ảnh!");
    }

    let imageUrl = "";
    if (imageBuffer) {
        imageUrl = await uploadImageService(imageBuffer);
    }

    const newPost = await Post.create({
        user: userId,
        title,
        content,
        image: imageUrl,
        likes: [],
        comments: [],
    });

    return newPost;
};
