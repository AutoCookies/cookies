import FollowUser from "../models/followUser.model.js";
import User from "../models/user.model.js";
import redisClient from '../config/redisClient.js';

const clearCache = async (prefix, userId) => {
    const keys = await redisClient.keys(`${prefix}:${userId}:page:*`);
    if (keys.length > 0) {
        await redisClient.del(keys);
    }
};

export const followUserService = async (userId, targetUserId) => {
    if (userId === targetUserId) {
        throw new Error("Bạn không thể follow chính mình!");
    }

    const userExists = await User.exists({ _id: targetUserId });
    if (!userExists) {
        throw new Error("Người dùng không tồn tại!");
    }

    const alreadyFollowed = await FollowUser.findOne({ follower: userId, following: targetUserId });
    if (alreadyFollowed) {
        throw new Error("Bạn đã follow người dùng này!");
    }

    await FollowUser.create({ follower: userId, following: targetUserId });

    await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } });

    // Xóa cache Redis đúng cách
    await clearCache("followers", targetUserId);
    await clearCache("following", userId);

    return { message: "Follow thành công!" };
};

export const unfollowUserService = async (userId, targetUserId) => {
    if (userId === targetUserId) {
        throw new Error("Bạn không thể unfollow chính mình!");
    }

    const followRecord = await FollowUser.findOneAndDelete({ follower: userId, following: targetUserId });

    if (!followRecord) {
        throw new Error("Bạn chưa follow người dùng này!");
    }

    await clearCache("followers", targetUserId);
    await clearCache("following", userId);

    await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followingCount: -1 } });

    return { message: "Unfollow thành công!" };
};

export const getFollowersService = async (userId, page = 1, limit = 10) => {
    if (!userId) throw new Error("User ID is required");
    const cacheKey = `followers:${userId}:page:${page}`;

    try {
        const cacheData = await redisClient.get(cacheKey);
        if (cacheData) return JSON.parse(cacheData);

        const followers = await FollowUser.find({ following: userId })
            .populate("follower", "userId username profilePicture followerCount followingCount")
            .lean()
            .skip((page - 1) * limit)
            .limit(limit);

        await redisClient.set(cacheKey, JSON.stringify(followers), "EX", 3600); // Cache trong 1 giờ
        return followers;
    } catch (error) {
        console.error("Error fetching followers:", error);
        throw new Error("Could not retrieve followers");
    }
};

export const getFollowingService = async (userId, page = 1, limit = 10) => {
    if (!userId) throw new Error("User ID is required");
    const cacheKey = `following:${userId}:page:${page}`;

    try {
        const cacheData = await redisClient.get(cacheKey);
        if (cacheData) return JSON.parse(cacheData);

        const following = await FollowUser.find({ follower: userId })
            .populate("following", "userId username profilePicture followerCount followingCount")
            .lean()
            .skip((page - 1) * limit)
            .limit(limit);

        await redisClient.set(cacheKey, JSON.stringify(following), "EX", 3600); // Cache trong 1 giờ
        return following;
    } catch (error) {
        console.error("Error fetching following:", error);
        throw new Error("Could not retrieve following");
    }
};

// Kiểm tra trạng thái bản thân có đang follow một user nào đó hay không?
// @param {string} currentUserId - ID của người dùng hiện tại
// @param {string} targetUserId - ID của người dùng mục tiêu
// @returns {boolean} - Trả về true nếu đang follow, false nếu không
// @throws {Error} - Nếu có lỗi xảy ra trong quá trình kiểm tra
export const checkFollowStatusService = async (currentUserId, targetUserId) => {
    if (!currentUserId || !targetUserId) {
        throw new Error("Thiếu thông tin người dùng.");
    }

    try {
        // Kiểm tra trong database
        const isFollowing = await FollowUser.exists({ follower: currentUserId, following: targetUserId });

        return !!isFollowing;
    } catch (error) {
        console.error("Lỗi khi kiểm tra follow status:", error);
        throw new Error("Không thể kiểm tra trạng thái follow.");
    }
};


export const getFollowersOfUserService = async (currentUserId) => {
    try {
      const followers = await FollowUser.find({ following: currentUserId }) // Người đang follow currentUserId
        .populate("follower", "_id username profilePicture")
        .lean();
  
      return followers.map(f => f.follower);
    } catch (error) {
      console.error("Error getting followers:", error);
      throw new Error("Không thể lấy danh sách follower");
    }
  };
  