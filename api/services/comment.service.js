import Comment from "../models/comment.model.js";
import LikeComment from "../models/likeComment.model.js";
import Post from '../models/post.model.js';
import redisClient from '../config/redisClient.js';

export const commentPostService = async (userId, postId, content) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error("Post is not found")
    }

    const newComment = new Comment({ post: postId, user: userId, content: content })
    await newComment.save();
    post.commentCount += 1;
    post.save();
    await redisClient.del('all_posts');
    return { message: "Comment successfully" }
}

export const deleteCommentService = async (commentId, userId) => {
    // Tìm comment trong database
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new Error("Comment not found");
    }

    // Kiểm tra xem người dùng có quyền xóa comment không (chỉ xóa nếu là người tạo comment hoặc admin)
    if (comment.user.toString() !== userId && !userHasAdminRights(userId)) {
        throw new Error("You do not have permission to delete this comment");
    }

    // Xóa comment khỏi bài viết
    const post = await Post.findById(comment.post);
    if (!post) {
        throw new Error("Post not found");
    }

    // Xóa comment khỏi mảng comments của post
    post.comments = post.comments.filter(
        (commentId) => commentId.toString() !== commentId
    );

    await post.save();

    // Xóa tất cả các lượt like liên quan đến comment này
    await LikeComment.deleteMany({ comment: commentId });

    // Xóa comment khỏi database
    await comment.remove();
    await redisClient.del('all_posts');
    return { message: "Comment deleted successfully" };
};

export const editCommentService = async (commentId, userId, newContent) => {
    // Tìm comment trong database
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new Error("Comment not found");
    }

    // Kiểm tra xem người dùng có quyền chỉnh sửa comment không (chỉ chỉnh sửa nếu là người tạo comment hoặc admin)
    if (comment.user.toString() !== userId && !userHasAdminRights(userId)) {
        throw new Error("You do not have permission to edit this comment");
    }

    // Cập nhật nội dung comment
    comment.content = newContent;
    await comment.save();

    return { message: "Comment updated successfully", comment };
};