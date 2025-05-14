import { 
  getUserStatisticsService,
  getPostStatisticsService
} from "../../services/admin/statistic.service.js";

export const getUserStatistics = async (req, res) => {
  try {
    const stats = await getUserStatisticsService();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error getting user statistics:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê người dùng"
    });
  }
};

export const getPostStatistics = async (req, res) => {
  try {
    const stats = await getPostStatisticsService();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error getting post statistics:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê bài viết"
    });
  }
}
