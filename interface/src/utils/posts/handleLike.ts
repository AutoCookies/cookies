import { ENV_VARS } from "@/config/envVars";

export const handleLike = async (
  postId: string, 
  liked: boolean, 
  onSuccess: () => void
) => {
  try {
    // console.log(`Like bài viết: ${postId}`);

    const response = await fetch(`${ENV_VARS.API_ROUTE}/likes/post/${postId}/like`, {
      method: liked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Không thể like bài viết!");
    }

    // console.log("Like thành công!");
    
    onSuccess(); // Gọi callback sau khi like thành công
  } catch (error) {
    console.error("Lỗi khi like bài viết:", error);
  }
};
