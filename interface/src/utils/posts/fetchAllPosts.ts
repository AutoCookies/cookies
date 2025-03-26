// src/utils/fetchPosts.ts
import { ENV_VARS } from "@/config/envVars";

export const getAllPosts = async () => {
  try {
    const response = await fetch(`${ENV_VARS.API_ROUTE}/posts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      // console.error("API Error:", errorData);
      return { data: [], error: errorData?.message || "Có lỗi xảy ra khi lấy dữ liệu." };
    }

    const data = await response.json();
    // console.log("API trả về:", JSON.stringify(data, null, 2));

    return { data, error: "" };
  } catch (err: any) {
    // console.error("Lỗi fetch:", err);
    return { data: [], error: err.message || "Có lỗi xảy ra." };
  }
};

