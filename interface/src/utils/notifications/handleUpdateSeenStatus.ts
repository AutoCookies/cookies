import axios from "axios";
import { ENV_VARS } from "@/lib/envVars";

interface UpdateSeenStatusParams {
  notificationId: string;
}

export const handleUpdateSeenStatus = async ({ notificationId }: UpdateSeenStatusParams) => {
  try {
    if (!notificationId) return;

    const response = await fetch(`${ENV_VARS.API_ROUTE}/notifications/seen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // đảm bảo cookie/session được gửi
      body: JSON.stringify({ notificationId }), 
    });

    const result = await response.json();

    console.log(`Notification ID: ${notificationId}`);

    if (response.status === 200) {
      console.log("Notification marked as seen.");
      return result;    
    }
  } catch (error) {
    console.error("Failed to update notification status:", error);
    throw error;
  }
};
