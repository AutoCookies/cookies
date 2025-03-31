// src/utils/fetchPosts.ts
import { ENV_VARS } from "@/lib/envVars";

export const getAllPosts = async (page: number = 1, limit: number = 10) => {
  try {
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
      return { data: [], error: errorData?.message || "Có lỗi xảy ra khi lấy dữ liệu." };
    }

    const data = await response.json();
    return { data, error: "" };
  } catch (err: any) {
    return { data: [], error: err.message || "Có lỗi xảy ra." };
  }
};
