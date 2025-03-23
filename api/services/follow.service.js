import FollowUser from "../models/followUser.model.js";
import User from "../models/User.model.js";

export const followUserService = async (userId, targetUserId) => {
    if (userId === targetUserId) {
        throw new Error("Bạn không thể follow chính mình!");
    }

    // Kiểm tra user tồn tại
    const userExists = await User.exists({ _id: targetUserId });
    if (!userExists) {
        throw new Error("Người dùng không tồn tại!");
    }

    // Kiểm tra nếu đã follow trước đó
    const alreadyFollowed = await FollowUser.findOne({ follower: userId, following: targetUserId });
    if (alreadyFollowed) {
        throw new Error("Bạn đã follow người dùng này!");
    }

    // Tạo bản ghi mới trong FollowUser
    await FollowUser.create({ follower: userId, following: targetUserId });

    // Cập nhật followerCount và followingCount
    await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } });

    return { message: "Follow thành công!" };
};

export const unfollowUserService = async (userId, targetUserId) => {
    if (userId === targetUserId) {
        throw new Error("Bạn không thể unfollow chính mình!");
    }

    // Kiểm tra nếu đã follow trước đó
    const followRecord = await FollowUser.findOneAndDelete({ follower: userId, following: targetUserId });

    if (!followRecord) {
        throw new Error("Bạn chưa follow người dùng này!");
    }

    // Giảm followerCount và followingCount (đảm bảo không âm)
    await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followingCount: -1 } });

    return { message: "Unfollow thành công!" };
};

