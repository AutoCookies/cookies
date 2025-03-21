import Comment from "../models/comment.model.js";
import LikeComment from "../models/likeComment.model.js";
import Post from '../models/post.model.js';

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

        return { message: "Comment liked successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Unlike comment
export const unlikeCommentService = async (userId, commentId) => {
    try {
        // Xóa bản ghi like
        const like = await LikeComment.findOneAndDelete({ user: userId, comment: commentId });
        if (!like) {
            throw new Error("Like not found");
        }

        return { message: "Comment unliked successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

export const likePostService = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Tìm trong Post trước, nếu không có thì tìm trong SharePost
    let post = await Post.findById(postId) || await SharePost.findById(postId);
    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra nếu user đã like
    if (post.likes.includes(userId)) {
        throw new Error("Bạn đã thích bài viết này rồi!");
    }

    // Thêm userId vào danh sách likes
    post.likes.push(userId);
    user.likedPosts.push(postId);

    await post.save();
    await user.save();

    return post;
};

export const unlikePostService = async (userId, postId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    // Tìm trong Post trước, nếu không có thì tìm trong SharePost
    let post = await Post.findById(postId) || await SharePost.findById(postId);
    if (!post) throw new Error("Bài viết không tồn tại!");

    // Kiểm tra nếu user chưa like
    if (!post.likes.includes(userId)) {
        throw new Error("Bạn chưa thích bài viết này!");
    }

    // Xóa userId khỏi danh sách likes
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    user.likedPosts = user.likedPosts.filter(id => id.toString() !== postId.toString());

    await post.save();
    await user.save();

    return post;
};

