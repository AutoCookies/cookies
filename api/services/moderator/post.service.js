// services/post.service.js
import Post from "../../models/post.model.js";
import { SharePost } from "../../models/sharedPost.model.js";

export const getAllPostsService = async () => {
    const posts = await Post.find()
        .populate("user", "_idusername email") // populate user info if needed
        .sort({ createdAt: -1 }); // newest first
    return posts;
};

export const getAllSharePostsService = async () => {
  const posts = await SharePost.find()
    .populate("user", "_id username email") // populate user của SharePost
    .populate({
      path: "originalPost",
      populate: { path: "user", select: "_id username email" }, // populate user của originalPost
    })
    .sort({ createdAt: -1 });

  return posts;
};

export const deletePostByIdService = async (postId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error("Post not found");
    }

    await post.deleteOne(); // Gọi middleware để xoá liên quan (like, comment)
    return { message: "Post deleted successfully" };
};

export const deleteSharePostByIdService = async (postId) => {
    const post = await SharePost.findById(postId);
    if (!post) {
        throw new Error("Post not found");
    }

    await post.deleteOne(); // Gọi middleware để xoá liên quan (like, comment)
    return { message: "Post deleted successfully" };
}