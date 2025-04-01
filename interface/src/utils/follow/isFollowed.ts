import { ENV_VARS } from "@/lib/envVars";

export const isFollowed = async (targetUserId: string) => {
    try {
        console.log(`Checking follow status for user ID: ${targetUserId}`);
        const response = await fetch(`${ENV_VARS.API_ROUTE}/follow/${targetUserId}/check`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(`Follow status for user ${targetUserId}:`, data);
        return data;

    } catch (error) {
        console.log("Error checking follow status:", error);
    }
}