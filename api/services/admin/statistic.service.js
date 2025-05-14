import User from "../../models/user.model.js";

export const getUserStatisticsService = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, 
    verifiedUsers, 
    bannedUsers, 
    newUsersThisMonth, 
    totalAdminUser, 
    totalUser, 
    totalModeratorUser, 
    totalPublicUser, 
    totalPrivateUser
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "moderator" }),
    User.countDocuments({ visibility: "public" }),
    User.countDocuments({ visibility: "private" }),
  ]);

  return {
    totalUsers,
    verifiedUsers,
    bannedUsers,
    newUsersThisMonth,
    totalAdminUser,
    totalUser,
    totalModeratorUser,
    totalPublicUser,
    totalPrivateUser
  };
};

export const getPostStatisticsService = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalPosts, newPostsThisMonth] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ createdAt: { $gte: startOfMonth } })
  ]);

  return {
    totalPosts,
    newPostsThisMonth
  };
}