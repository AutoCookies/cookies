import { ENV_VARS } from "@/config/envVars";

export const handleDeleteComment = async (commentId: string) => {
    // Gửi request đến api xóa bài viết
    try {
        console.log(`Xóa bài viết: ${commentId}`);

        const response = await fetch(`${ENV_VARS.API_ROUTE}/comments/comment/${commentId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Không thể xóa bài viết");
        }

        console.log("Xoa bai viet thanh cong!");

        return await response.json();
    } catch (error) {
        console.error("Delete comment error:", error);
        throw error;
    }
}