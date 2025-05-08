// utils/notifications/handleNotifyFollowers.ts
import { ENV_VARS } from "@/lib/envVars";

/**
 * Các loại notification có thể gửi đến followers
 */

export enum NotifyType {
    post = "post",
    like = "like",
    comment = "comment",
    follow = "follow",
    mention = "mention",
}

export interface NotifyFollowersPayload {
  type: NotifyType;      // loại thông báo
  content: string;       // nội dung thông báo
}

export interface NotifyFollowersResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Gửi notification đến tất cả followers của current user (actor)
 *
 * @param payload - chứa fromUserId, type và content của notification
 * @returns { success, message?, error? }
 */
export const handleNotifyFollowers = async (
  payload: NotifyFollowersPayload
): Promise<NotifyFollowersResponse> => {
  try {
    const response = await fetch(
      `${ENV_VARS.API_ROUTE}/notifications/followers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result?.message || "Failed to notify followers.",
      };
    }

    return {
      success: true,
      message: result?.message,
    };
  } catch (err: any) {
    console.error("Error in handleNotifyFollowers:", err);
    return {
      success: false,
      error: err.message || "Unknown error",
    };
  }
};
