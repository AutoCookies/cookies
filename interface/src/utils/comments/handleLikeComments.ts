import { ENV_VARS } from "@/config/envVars";

export const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
        console.log(`Trạng thái isLiked: ${isLiked}`);
        
        if (!commentId || typeof commentId !== "string") {
            console.error("commentId không hợp lệ:", commentId);
            return; // Không tiếp tục nếu commentId không hợp lệ
        }

        const response = await fetch(`${ENV_VARS.API_ROUTE}/likes/comment/${commentId}/like`, {
            method: isLiked ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        // Debug response status and content
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data); // Log the response data

        if (!response.ok) {
            throw new Error("Không thể like bài viết");
        }

        return data; // Assuming data includes updated comment info, or a success message
    } catch (error) {
        console.error("Lỗi khi like bình luận:", error);
        throw error; // Re-throwing the error to handle it in the caller function
    }
};