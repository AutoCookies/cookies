import {
    createPostService
} from '../services/post.service.js';

/**
 * Controller để đăng bài viết
 * @route POST /api/posts
 * @access Private (Cần đăng nhập)
 */
export const createPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, content } = req.body;
        const imageBuffer = req.file ? req.file.buffer : null;

        const newPost = await createPostService(userId, title, content, imageBuffer);

        res.status(201).json({
            message: "Bài đăng đã được tạo thành công!",
            post: newPost,
        });
    } catch (error) {
        console.error("Error in createPost:", error.message);
        res.status(400).json({ message: error.message });
    }
};



