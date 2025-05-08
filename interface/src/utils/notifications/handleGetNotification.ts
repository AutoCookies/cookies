import { ENV_VARS } from "@/lib/envVars";

export interface Notification {
  _id: string;
  fromUser: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  type: "like" | "comment" | "follow" | "mention";
  createdAt: string;
  seen: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

export const handleGetNotification = async (
  page: number = 1,
  limit: number = 10
): Promise<{ data: NotificationResponse | null; error: string }> => {
  try {
    const response = await fetch(
      `${ENV_VARS.API_ROUTE}/notifications?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // đảm bảo cookie được gửi đi nếu dùng session
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: null,
        error: errorData?.message || "Có lỗi xảy ra khi lấy dữ liệu.",
      };
    }

    const json = await response.json();

    return {
      data: json.data,
      error: "",
    };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || "Có lỗi xảy ra.",
    };
  }
};
