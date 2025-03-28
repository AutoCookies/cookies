import {
    createPostService,
    getOwnPostsService,
    updatePostService,
    deletePostService,
    sharePostService,
    getAllPostsService,
} from '../services/post.service.js';

/**
 * Controller để đăng bài viết
 * @route POST /api/posts
 * @access Private (Cần đăng nhập)
 */
export const createPost = async (req, res) => {
    try {
        console.log(`User id: ${req.user._id}`);
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

export const getOwnPosts = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy userId từ token
        const posts = await getOwnPostsService(userId);

        res.status(200).json({
            message: "Lấy danh sách bài đăng thành công!",
            posts,
        });
    } catch (error) {
        console.error("Error in getPosts:", error.message);
        res.status(400).json({ message: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const { title, content } = req.body;
        const imageBuffer = req.file ? req.file.buffer : null;

        console.log("Received image file:", req.file); // 🛠 Debug

        const updatedPost = await updatePostService(userId, postId, title, content, imageBuffer);

        res.status(200).json({
            message: "Bài đăng đã được cập nhật thành công!",
            post: updatedPost,
        });
    } catch (error) {
        console.error("Error in updatePost:", error.message);
        res.status(400).json({ message: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy userId từ token
        const { postId } = req.params; // Lấy postId từ request

        const result = await deletePostService(userId, postId);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi trong deletePost:", error.message);
        return res.status(400).json({ message: error.message });
    }
};

export const sharePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const { caption, visibility = "public" } = req.body;

        console.log("📤 Dữ liệu nhận từ frontend:", { caption, visibility });

        const sharedPost = await sharePostService(userId, postId, caption, visibility);

        return res.status(201).json({
            message: "Bài viết đã được chia sẻ!",
            sharedPost
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};


export const getAllPosts = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const posts = await getAllPostsService(userId, page, limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


