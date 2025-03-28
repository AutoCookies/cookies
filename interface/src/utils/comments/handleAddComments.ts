// src/utils/comments/handleAddComment.ts
import { ENV_VARS } from "@/config/envVars";

interface AddCommentParams {
  postId: string;
  content: string;
}

export const handleAddComment = async ({ postId, content }: AddCommentParams) => {
  try {
    console.log(`Adding comment to post ${postId}`);
    
    const response = await fetch(`${ENV_VARS.API_ROUTE}/comments/comment/${postId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content
      }),
    });

    console.log("Add comment response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add comment");
    }

    const data = await response.json();
    console.log("Comment added successfully:", data);
    return data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};