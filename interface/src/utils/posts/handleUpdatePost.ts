// utils/posts/handleUpdatePost.ts
import { ENV_VARS } from "@/config/envVars";

interface UpdatePostParams {
  title?: string;
  content?: string;
  image?: File | null;
}

interface UpdatePostResponse {
  success: boolean;
  message?: string;
  post?: any;
}

export const handleUpdatePost = async (
  postId: string,
  updateData: UpdatePostParams,
  onSuccess?: (updatedPost: any) => void,
  onError?: (error: string) => void
): Promise<UpdatePostResponse> => {
  try {
    const formData = new FormData();
    
    // Thêm các trường dữ liệu vào FormData
    if (updateData.title !== undefined) formData.append('title', updateData.title);
    if (updateData.content !== undefined) formData.append('content', updateData.content);
    if (updateData.image) formData.append('image', updateData.image);

    const response = await fetch(`${ENV_VARS.API_ROUTE}/posts/update/${postId}/post`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật bài viết thất bại");
    }

    const result = await response.json();
    const updatedPost = result.post;

    // Gọi callback thành công nếu có
    onSuccess?.(updatedPost);
    
    return {
      success: true,
      message: result.message || "Cập nhật bài viết thành công",
      post: updatedPost
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
    
    // Gọi callback lỗi nếu có
    onError?.(errorMessage);
    
    console.error("Lỗi khi cập nhật bài viết:", error);
    return {
      success: false,
      message: errorMessage
    };
  }
};