import Comment from "../models/comment.model.js";
import LikeComment from "../models/likeComment.model.js";
import Post from '../models/post.model.js';
import {SharePost} from '../models/sharedPost.model.js';
import redisClient from '../config/redisClient.js';

export const commentPostService = async (userId, postId, content) => {
    // Xác định bài viết là Post hay SharePost
    let post = await Post.findById(postId);
    let postModel = "Post";

    if (!post) {
        post = await SharePost.findById(postId);
        postModel = "SharePost";
    }

    if (!post) {
        throw new Error("Post or SharePost not found");
    }

    // Tạo comment
    const newComment = new Comment({ 
        post: postId, 
        postModel: postModel, // Thêm refModel 
        user: userId, 
        content: content 
    });

    await newComment.save();

    // Cập nhật số lượng comment của bài viết
    post.commentCount += 1;
    await post.save();

    // Cache riêng comment (nếu cần dùng chi tiết comment)
    await redisClient.set(`comment:${newComment._id}`, JSON.stringify(newComment), { EX: 600 });

    // Invalidate cache danh sách comment của bài viết
    const keysToDelete = await redisClient.keys(`comments:${postId}:page:*`);
    if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
    }
    
    // Nếu có cache toàn bộ bài viết, xóa luôn để cập nhật commentCount mới
    await redisClient.del("all_posts");

    return { message: "Comment successfully", comment: newComment };
};

export const deleteCommentService = async (commentId, userId) => {
    // Tìm comment trong database
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new Error("Comment not found");
    }

    console.log(`User ID from request: ${userId}`);
    console.log(`Comment Owner ID: ${comment.user.toString()}`);

    // Kiểm tra quyền xóa
    if (comment.user.toString() !== userId) {
        throw new Error("You do not have permission to delete this comment");
    }

    // Xác định bài viết gốc (Post hoặc SharePost)
    let post = await Post.findById(comment.post);
    if (!post) {
        post = await SharePost.findById(comment.post);
    }
    if (!post) {
        throw new Error("Post or SharePost not found");
    }

    // Giảm số lượng comment của bài viết (không âm)
    post.commentCount = Math.max(0, post.commentCount - 1);
    await post.save();

    // Xóa tất cả các lượt like liên quan đến comment
    await LikeComment.deleteMany({ comment: commentId });

    // Xóa comment khỏi database
    await comment.deleteOne();
    
    // Xóa cache riêng của comment (nếu có)
    await redisClient.del(`comment:${commentId}`);
    
    // Xóa cache danh sách comment của post
    const keysToDelete = await redisClient.keys(`comments:${comment.post}:page:*`);
    if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
    }
    
    // Nếu có cache danh sách toàn bộ bài viết, xóa luôn
    await redisClient.del("all_posts");

    return { message: "Comment deleted successfully" };
};


export const editCommentService = async (commentId, userId, newContent) => {
    // Tìm comment trong database
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new Error("Comment not found");
    }

    // Ép kiểu ObjectId thành string trước khi so sánh
    if (comment.user.toString() !== userId) {
        throw new Error("You do not have permission to edit this comment");
    }

    // Xác định bài viết gốc (Post hoặc SharePost)
    let post = await Post.findById(comment.post);
    if (!post) {
        post = await SharePost.findById(comment.post);
    }
    if (!post) {
        throw new Error("Post or SharePost not found");
    }

    // Cập nhật nội dung comment
    comment.content = newContent;
    comment.updatedAt = new Date();
    await comment.save();

    // Invalidate cache của comment riêng
    await redisClient.del(`comment:${commentId}`);

    // Invalidate cache của danh sách comment của bài viết (tất cả các trang)
    const keysToDelete = await redisClient.keys(`comments:${comment.post}:page:*`);
    if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
    }

    // Nếu có cache toàn bộ bài viết, cũng xóa để cập nhật số liệu mới (nếu cần)
    await redisClient.del("all_posts");

    return { message: "Comment updated successfully", comment };
};


export const getCommentsByPostService = async (postId, page = 1, limit = 10) => {
    const cacheKey = `comments:${postId}:page:${page}`;

    // 1️⃣ Kiểm tra cache trước
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("Lấy comment từ cache!");
        return JSON.parse(cachedData);
    }

    const post = await Post.findById(postId) || await SharePost.findById(postId);
    if (!post) throw new Error("Post or SharePost not found");

    const comments = await Comment.find({ post: postId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "_id username avatar");

    const totalComments = await Comment.countDocuments({ post: postId });

    const result = {
        totalComments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        comments,
    };

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 600 });

    return result;
};

