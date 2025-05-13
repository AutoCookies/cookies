import { ENV_VARS } from "@/lib/envVars";

// Định nghĩa kiểu dữ liệu cho kết quả trả về từ API
interface UserStatistics {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  newUsersThisMonth: number;
}

// Hàm gọi API và trả về thống kê người dùng
export const handleGetUserStatistics = async (): Promise<UserStatistics | null> => {
  try {
    const response = await fetch(`${ENV_VARS.API_ROUTE}/admin/statistic/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Đảm bảo gửi cookie (nếu dùng JWT hoặc session-based auth)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Lỗi khi fetch user statistics:", error?.message || response.statusText);
      return null;
    }

    const result = await response.json();

    if (!result.success) {
      console.error("API trả về lỗi:", result.message);
      return null;
    }

    return result.data as UserStatistics;
  } catch (err) {
    console.error("Lỗi mạng hoặc lỗi hệ thống khi gọi API thống kê:", err);
    return null;
  }
};
