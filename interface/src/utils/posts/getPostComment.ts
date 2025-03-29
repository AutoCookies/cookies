import { ENV_VARS } from "@/config/envVars";

export const getPostComments = async (postId: string) => {
    // console.log(`Lấy bình luận bài viết: ${postId}`);
    try {
        const response = await fetch(`${ENV_VARS.API_ROUTE}/comments/${postId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        // console.log("API Response:", response.status, response, response.type);

        if (!response.ok) {
            throw new Error("Không thể lấy danh sách bình luận.");
        }

        const data = await response.json();
        // console.log("Dữ liệu từ API:", JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy bình luận:", error);
        return null;
    }
};
