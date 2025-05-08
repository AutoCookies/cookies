// utils/notifications/handleAddNotification.ts

import { ENV_VARS } from "@/lib/envVars";

export interface AddNotificationPayload {
  fromUserId: string;
  type: "like" | "comment" | "follow" | "mention";
  content: string;
}

export const handleAddNotification = async (
  payload: AddNotificationPayload
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${ENV_VARS.API_ROUTE}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // đảm bảo cookie/session được gửi
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result?.message || "Thêm thông báo thất bại.",
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Lỗi không xác định.",
    };
  }
};
