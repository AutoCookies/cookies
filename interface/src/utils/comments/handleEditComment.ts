// src/utils/comments/handleEditComment.ts
import { ENV_VARS } from "@/config/envVars";

interface EditCommentParams {
  commentId: string;
  newContent: string;
}

export const handleEditComment = async ({ commentId, newContent }: EditCommentParams) => {
  try {
    console.log(`Updating comment ${commentId} with new content`);
    
    const response = await fetch(`${ENV_VARS.API_ROUTE}/comments/comment/${commentId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: newContent
      }),
    });

    console.log("Edit comment response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to edit comment");
    }

    const data = await response.json();
    console.log("Comment updated successfully:", data);
    return data;
  } catch (error) {
    console.error("Error editing comment:", error);
    throw error;
  }
};