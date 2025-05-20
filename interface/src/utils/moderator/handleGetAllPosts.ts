// lib/api/handleGetAllPosts.ts
import { ENV_VARS } from "@/lib/envVars";
export type UserType = {
  _id: string;
  username: string;
  email: string;
};

export type PostType = {
  _id: string;
  user: UserType;
  title: string;
  content: string;
  visibility: string;
  createdAt: string;
  likesCount: number;      
  commentCount: number;   
  image?: string;
};

export const handleGetAllPosts = async (): Promise<PostType[]> => {
  try {
    const res = await fetch(`${ENV_VARS.API_ROUTE}/moderator/posts`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch posts");
    }

    return data.data as PostType[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};
