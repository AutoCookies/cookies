// utils/posts/handleDeletePost.ts
import { ENV_VARS } from "@/config/envVars";

interface DeleteResponse {
  message: string;
  success: boolean;
}

export const handleDeletePost = async (
  postId: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
): Promise<DeleteResponse> => {
  try {
    // Hiển thị confirm dialog trước khi xóa
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return { message: "Đã hủy thao tác xóa", success: false };
    }

    const response = await fetch(`${ENV_VARS.API_ROUTE}/posts/delete/${postId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể xóa bài viết");
    }

    const data = await response.json();
    console.log("Xóa bài viết thành công:", data.message);
    
    onSuccess?.();
    return { ...data, success: true };

  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định khi xóa bài viết";
    
    onError?.(errorMessage);
    return { message: errorMessage, success: false };
  }
};