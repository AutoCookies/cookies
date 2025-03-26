import { ENV_VARS } from "@/config/envVars";

export const handleShare = async (
  postId: string, 
  caption: string, 
  visibility: "public" | "private" | "friends",
  onSuccess: () => void
) => {
  try {
    console.log(`Chia sẻ bài viết: ${postId} với quyền: ${visibility}`);

    const response = await fetch(`${ENV_VARS.API_ROUTE}/posts/${postId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ caption, visibility }),
    });

    if (!response.ok) {
      throw new Error("Không thể chia sẻ bài viết!");
    }

    console.log("Chia sẻ thành công!");

    onSuccess();
  } catch (error) {
    console.error("Lỗi khi chia sẻ bài viết:", error);
  }
};
