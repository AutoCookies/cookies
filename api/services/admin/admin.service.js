import User from "../../models/user.model.js";
import Post from '../../models/post.model.js';
import { SharePost } from '../../models/sharedPost.model.js';
import mongoose from 'mongoose';
import { generateTokenAndSetCookie } from '../../utils/generateToken.js';
import BanHistory from "../../models/banHistory.model.js";

export const getUserService = async (currentUser, id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID!");
    }

    const user = await User.findById(id).lean();
    if (!user) throw new Error("User not found");
    return user;
};

//
export const getAllUserService = async (currentUser, page = 1, limit = 20) => {
    if (!currentUser || currentUser.role !== "admin") {
        throw new Error("Bạn không có quyền xem danh sách người dùng!");
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .select("-password")
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments()
    ]);

    return {
        total,
        page,
        limit,
        users
    };
};

export const deleteUserService = async (currentUser, userId) => {
    if (currentUser.role !== "admin") {
        throw new Error("Bạn không có quyền xóa tài khoản!");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");

    await user.deleteOne();
    return { message: "Tài khoản đã được xóa!" };
};

export const createAccountService = async ({ username, fullName, email, password, role }, currentUser, res) => {
    if (!username || !fullName || !email || !password) {
        throw new Error("All fields are required!");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email!");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters!");
    }

    const userExists = await User.exists({ email });
    if (userExists) throw new Error("Email already exists!");

    let assignedRole = "user";
    if (role && ["admin", "moderator"].includes(role)) {
        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Permission denied! Only admins can create admin or moderator accounts.");
        }
        assignedRole = role;
    }

    const user = await User.create({ username, fullName, email, password, role: assignedRole });

    if (!user) throw new Error("Create user failed!");

    const token = generateTokenAndSetCookie(user._id, res);

    return {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: token,
    };
};

export const adminDeletePostService = async (postId, userId) => {
    let post = Post.findById(postId);
    let sharePost = SharePost.findById(postId);
    const user = await User.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại!");
    if (!post && !sharePost) {
        throw new Error("Bài viết không tồn tại!");
    }

    if (post) {
        await post.deleteOne();
    } else if (sharePost) {
        await sharePost.deleteOne();
    }

    return { message: "Bài viết được xóa!" };
};



export const getAllPostsForAdminService = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const posts = await Post.find({})
        .populate("user", "username profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Lấy tất cả SharePost
    const sharePosts = await SharePost.find({})
        .populate("user", "username profilePicture")
        .populate("originalPost", "title content image user")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return { posts, sharePosts };
};

export const searchUserByNameService = async (query, limit = 10) => {
    try {
        const users = await User.find({
            $or: [
                { fullname: { $regex: query, $options: "i" } }, // Tìm theo fullname
                { username: { $regex: query, $options: "i" } } // Tìm theo username
            ]
        })
        .limit(limit) // Giới hạn số lượng kết quả
        .select("_id username fullname email avatar"); // Chỉ lấy thông tin cần thiết

        return users;
    } catch (error) {
        throw new Error("Lỗi khi tìm kiếm người dùng: " + error.message);
    }
};

export const banUserService = async (userId, adminId, { duration, reason }) => {
    console.log("userId:", userId);
    const user = await User.findById(userId);

    if (!user) {
        console.error("Không tìm thấy user với ID:", userId);
        throw new Error("Người dùng không tồn tại!");
    }

    let banExpiresAt = null;
    if (duration > 0) {
        banExpiresAt = new Date();
        banExpiresAt.setDate(banExpiresAt.getDate() + duration);
    }

    // Tạo bản ghi BanHistory trước
    const banRecord = new BanHistory({
        user: userId,
        admin: adminId,
        reason,
        duration,
        banExpiresAt
    });

    await banRecord.save();

    // Thêm ID của bản ghi vào user.banHistory
    user.banHistory.push(banRecord._id);
    user.isBanned = true;

    await user.save();

    return {
        message: `Người dùng đã bị chặn ${duration > 0 ? `trong ${duration} ngày` : "vĩnh viễn"}!`,
        banRecord
    };
};

export const unbanUserService = async (userId, adminId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("Người dùng không tồn tại!");
    }
    if (!user.isBanned) {
        throw new Error("Người dùng không bị chặn!");
    }

    user.isBanned = false;
    await user.save();

    return {
        message: "Người dùng đã được mở khóa!",
    };
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

