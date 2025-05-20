// lib/api/handleGetAllSharePosts.ts
import { ENV_VARS } from "@/lib/envVars";
export type UserType = {
  _id: string;
  username: string;
  email: string;
};

export type OriginalPostType = {
  _id: string;
  title: string;
  content: string;
  visibility: string;
  createdAt: string;
  likesCount: number;
  commentCount: number; 
  image?: string;
};

export type SharePostType = {
  _id: string;
  user: UserType;
  originalPost: OriginalPostType;
  originalPostModel: "Post" | "SharePost";
  caption: string;
  commentCount: number;
  likesCount: number;
  visibility: string;
  createdAt: string;
};

export const handleGetAllSharePosts = async (): Promise<SharePostType[]> => {
  try {
    const res = await fetch(`${ENV_VARS.API_ROUTE}/moderator/shareposts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch share posts");
    }

    return data.data as SharePostType[];
  } catch (error) {
    console.error("Error fetching share posts:", error);
    throw error;
  }
};
