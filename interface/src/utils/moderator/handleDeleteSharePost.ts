// lib/api/handleDeleteSharePost.ts
import { ENV_VARS } from "@/lib/envVars";

export const handleDeleteSharePost = async (postId: string): Promise<{ message: string }> => {
  try {
    const res = await fetch(`${ENV_VARS.API_ROUTE}/moderator/shareposts/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to delete share post");
    }

    return { message: data.message };
  } catch (error) {
    console.error("Error deleting share post:", error);
    throw error;
  }
};
