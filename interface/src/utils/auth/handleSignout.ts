// utils/auth/handleSignout.ts
import { ENV_VARS } from "@/lib/envVars"; // hoặc đường dẫn tương ứng đến file ENV_VARS của bạn

interface ApiResponse {
  message: string;
}

export async function handleSignout(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${ENV_VARS.API_ROUTE}/auth/logout`, {
      method: "POST",
      credentials: "include", // để gửi cookie kèm theo
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Nếu status không phải 2xx, lấy error message từ server
      const errorData = await response.json();
      throw new Error(errorData.message || "Logout thất bại");
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    // Bắt lỗi mạng hoặc lỗi từ server
    throw new Error(error.message || "Không thể đăng xuất");
  }
}
