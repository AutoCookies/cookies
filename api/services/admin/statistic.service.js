import User from "../../models/user.model.js";

export const getUserStatisticsService = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, verifiedUsers, bannedUsers, newUsersThisMonth] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ createdAt: { $gte: startOfMonth } })
  ]);

  return {
    totalUsers,
    verifiedUsers,
    bannedUsers,
    newUsersThisMonth
  };
};
