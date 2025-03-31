import { ENV_VARS } from "@/lib/envVars";

interface ApiComment {
  _id: string;
  post: string;
  postModel: string;
  user: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  content: string;
  likeCount: number;
  createdAt: string;
  isLiked: boolean;
}

interface NormalizedComment {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  user: {
    id: string;
    username: string;
    profilePicture: string;
  };
}

export const getPostComments = async (postId: string): Promise<NormalizedComment[]> => {
  try {
    const response = await fetch(`${ENV_VARS.API_ROUTE}/comments/${postId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API response data:", data);

    // Normalize the data structure
    const normalizedComments = data?.data?.comments?.map((comment: ApiComment) => ({
      id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      likeCount: comment.likeCount,
      isLiked: comment.isLiked ?? false, // Default to false if undefined
      user: {
        id: comment.user._id,
        username: comment.user.username,
        profilePicture: comment.user.profilePicture,
      },
    })) || [];

    console.log("Normalized comments:", normalizedComments);
    return normalizedComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};