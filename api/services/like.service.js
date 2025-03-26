import Comment from "../models/comment.model.js";
import LikeComment from "../models/likeComment.model.js";
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import redisClient from '../config/redisClient.js';
import LikePost from "../models/likePost.model.js";
import {SharePost} from "../models/sharedPost.model.js";

// Like comment
export const likeCommentService = async (userId, commentId) => {
    try {
        // Kiểm tra comment có tồn tại không
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new Error("Comment not found");
        }

        // Kiểm tra nếu người dùng đã like comment
        const alreadyLiked = await LikeComment.findOne({ user: userId, comment: commentId });
        if (alreadyLiked) {
            throw new Error("You already liked this comment");
        }

        // Tạo mới bản ghi like
        const newLike = new LikeComment({ user: userId, comment: commentId });
        await newLike.save();

        // Tăng số lượt like của comment
        comment.likeCount += 1;
        await comment.save();

        // Xóa cache chi tiết của comment
        await redisClient.del(`comment:${commentId}`);

        // Xóa cache danh sách comment của bài viết liên quan (cho tất cả các trang)
        const keysToDelete = await redisClient.keys(`comments:${comment.post}:page:*`);
        if (keysToDelete.length > 0) {
            await redisClient.del(keysToDelete);
        }

        return { message: "Comment liked successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

export const unlikeCommentService = async (userId, commentId) => {
    try {
        // Kiểm tra xem comment có tồn tại không
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new Error("Comment not found");
        }

        // Xóa bản ghi like
        const like = await LikeComment.findOneAndDelete({ user: userId, comment: commentId });
        if (!like) {
            throw new Error("You haven't liked this comment yet");
        }

        // Giảm số lượt like của comment (đảm bảo không âm)
        comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1);
        await comment.save();

        // Xóa cache chi tiết của comment
        await redisClient.del(`comment:${commentId}`);

        // Invalidate cache danh sách comment của bài viết (cho tất cả các trang)
        const keysToDelete = await redisClient.keys(`comments:${comment.post}:page:*`);
        if (keysToDelete.length > 0) {
            await redisClient.del(keysToDelete);
        }

        return { message: "Comment unliked successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};


export const likePostService = async (userId, postId) => {
    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Kiểm tra bài viết có tồn tại không
    let post = await Post.findById(postId);
    let postType = "Post";

    if (!post) {
        post = await SharePost.findById(postId);
        postType = "SharePost";
    }

    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra nếu đã like bài viết
    const alreadyLiked = await LikePost.findOne({ user: userId, post: postId });
    if (alreadyLiked) {
        throw new Error("Bạn đã thích bài viết này rồi!");
    }

    // Thêm like vào bảng LikePost
    await LikePost.create({ user: userId, post: postId });

    // Cập nhật số lượt like của bài viết
    post.likesCount = (post.likesCount || 0) + 1;
    await post.save();

    // Thêm vào danh sách likedPosts trong User
    user.likedPosts.push({ postId, postType });
    await redisClient.del(`post:${postId}`);
    await user.save();

    return post;
};

export const unlikePostService = async (userId, postId) => {
    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Kiểm tra bài viết có tồn tại không
    let post = await Post.findById(postId);
    let postType = "Post";

    if (!post) {
        post = await SharePost.findById(postId);
        postType = "SharePost";
    }

    if (!post) throw new Error("Bài viết không tồn tại!");

    // Tìm và xóa bản ghi like từ LikePost
    const like = await LikePost.findOneAndDelete({ user: userId, post: postId });
    if (!like) {
        throw new Error("Bạn chưa thích bài viết này!");
    }

    // Giảm số lượt like của bài viết (đảm bảo không âm)
    post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
    await post.save();

    // Xóa bài viết khỏi danh sách likedPosts của user (nếu có)
    user.likedPosts = user.likedPosts.filter(liked => liked.postId.toString() !== postId.toString());
    await user.save();

    // Xóa cache Redis
    await redisClient.del(`post:${postId}`);

    return post;
};

/**
 * Kiểm tra danh sách postId nào đã được user like.
 * @param {string} userId - ID của user.
 * @param {string[]} postIds - Danh sách postId cần kiểm tra.
 * @returns {Promise<string[]>} - Trả về danh sách postId đã like.
 */
export const checkUserLikedPostsService = async (userId, postIds) => {
    if (!userId || !postIds || postIds.length === 0) return [];

    try {
        // Truy vấn nhanh bằng $in
        const likedPosts = await LikePost.find({ user: userId, post: { $in: postIds } }).select("post");

        return likedPosts.map((like) => like.post.toString());
    } catch (error) {
        console.error("Lỗi khi kiểm tra bài viết đã like:", error);
        throw new Error("Không thể kiểm tra trạng thái like.");
    }
};
