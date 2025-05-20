
import {
    getAllSharePostsService as fetchAllSharePosts,
    getAllPostsService as fetchAllPosts,
    deletePostByIdService as removePostById,
    deleteSharePostByIdService as removeSharePostById,
} from "../../services/moderator/post.service.js";

export const getAllPostsController = async (req, res) => {
    try {
        const posts = await fetchAllPosts(); // Không bị đệ quy
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error("Error getting posts:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllSharePostsController = async (req, res) => {
    try {
        const posts = await fetchAllSharePosts();
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        console.error("Error getting shared posts:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deletePostByIdController = async (req, res) => {
    const { postId } = req.params;
    try {
        const result = await removePostById(postId);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const deleteSharePostByIdController = async (req, res) => {
    const { postId } = req.params;
    try {
        const result = await removeSharePostById(postId);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error("Error deleting shared post:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

