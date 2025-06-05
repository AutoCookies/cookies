// utils/auth/handleSignout.ts
import { ENV_VARS } from "@/lib/envVars";

interface ApiResponse {
  success: boolean;
  message: string;
}

export async function handleSignout(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${ENV_VARS.API_ROUTE}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // Có thể thêm Authorization header nếu dùng
        // "Authorization": `Bearer ${localStorage.getItem('token')}`
      },
    });

    const data: ApiResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Logout failed");
    }

    // Xóa dữ liệu user ở client-side (nếu cần)
    localStorage.removeItem('user');
    sessionStorage.removeItem('tempData');
    
    return data;
  } catch (error: any) {
    console.error("Logout error:", error);
    // Vẫn trả về object đồng nhất với API success
    return {
      success: false,
      message: error.message || "Logout failed"
    };
  }
}