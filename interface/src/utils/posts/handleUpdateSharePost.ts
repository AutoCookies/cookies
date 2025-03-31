// utils/posts/handleUpdateSharePost.ts
import { ENV_VARS } from "@/lib/envVars";

interface UpdateSharePostParams {
  caption: string;
}

interface UpdateSharePostResponse {
  success: boolean;
  message?: string;
  sharePost?: any;
}

export const handleUpdateSharePost = async (
  sharePostId: string,
  updateData: UpdateSharePostParams,
  onSuccess?: (updatedSharePost: any) => void,
  onError?: (error: string) => void
): Promise<UpdateSharePostResponse> => {
  try {
    // Validate input
    if (!updateData.caption && updateData.caption !== "") {
      throw new Error("Vui lòng nhập caption!");
    }

    const response = await fetch(`${ENV_VARS.API_ROUTE}/posts/update/${sharePostId}/sharepost`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caption: updateData.caption
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật bài chia sẻ thất bại");
    }

    const result = await response.json();
    const updatedSharePost = result.post; // Lưu ý: API trả về trường 'post' thay vì 'sharePost'

    // Gọi callback thành công nếu có
    onSuccess?.(updatedSharePost);
    
    return {
      success: true,
      message: result.message || "Cập nhật bài chia sẻ thành công",
      sharePost: updatedSharePost
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
    
    // Gọi callback lỗi nếu có
    onError?.(errorMessage);
    
    console.error("Lỗi khi cập nhật bài chia sẻ:", error);
    return {
      success: false,
      message: errorMessage
    };
  }
};