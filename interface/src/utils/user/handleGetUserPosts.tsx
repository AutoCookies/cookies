import { ENV_VARS } from "@/lib/envVars";

export const handleGetUserPosts = async (userId: string, page = 1, limit = 10) => {
    console.log("Fetching user posts:", userId); // Debug log
    try {
        const response = await fetch(
            `${ENV_VARS.API_ROUTE}/posts/getPost/${userId}?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return { data: [], error: errorData?.message || "Có lỗi xảy ra khi lấy dữ liệu." };
        }

        const data = await response.json();
        console.log("API Response:", data); // Debug log

        // Kiểm tra và trả về mảng dữ liệu bài post
        return {
            data: Array.isArray(data) ? data : [],
            error: "",
        };
    } catch (error: any) {
        console.error("Error fetching user posts:", error);
        return { data: [], error: error?.message || "Có lỗi xảy ra khi lấy dữ liệu." };
    }
};
