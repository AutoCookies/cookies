// src/utils/fetchPosts.ts
import { ENV_VARS } from "@/lib/envVars";
import { handleRefreshToken } from "@/utils/auth/handleRefreshToken";

export const getAllPosts = async (page: number = 1, limit: number = 10) => {
  let retried = false; // tránh vòng lặp vô hạn nếu refresh cũng fail

  while (true) {
    try {
      console.debug(`[getAllPosts] Fetching page=${page} limit=${limit}... retried=${retried}`);
      const response = await fetch(
        `${ENV_VARS.API_ROUTE}/posts?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // DEBUG lỗi trả về từ backend
        console.debug("[getAllPosts] Response not ok:", errorData);

        // Nếu lỗi là access token hết hạn, thử refresh
        if (!retried && (
              errorData.code === "TOKEN_EXPIRED" ||
              errorData.message?.toLowerCase().includes("token expired")
            )
        ) {
          console.debug("[getAllPosts] Access token expired. Attempting to refresh...");
          const refreshed = await handleRefreshToken();
          if (refreshed) {
            retried = true;
            console.debug("[getAllPosts] Refresh success. Retrying getAllPosts...");
            continue; // quay lại thực hiện lại request
          } else {
            console.debug("[getAllPosts] Refresh token failed.");
            return { data: [], error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
          }
        }

        return { data: [], error: errorData?.message || "Có lỗi xảy ra khi lấy dữ liệu." };
      }

      const data = await response.json();
      console.debug("[getAllPosts] Fetch thành công:", data);
      return { data, error: "" };

    } catch (err: any) {
      console.debug("[getAllPosts] Fetch exception:", err);
      return { data: [], error: err.message || "Có lỗi xảy ra." };
    }
  }
};

