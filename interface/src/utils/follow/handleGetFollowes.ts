import { ENV_VARS } from "@/lib/envVars";

export const handleGetFollowes = async (currentUserId: string) => {
    try {
        const response = await fetch(`${ENV_VARS.API_ROUTE}/follow/${currentUserId}/followersOfUser`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response data:", errorData);
            throw new Error("Failed to fetch followers. Please try again later.");
        }

        const data = await response.json(); // Expecting array
        console.log("Get followers response data:", data);
        return data;

    } catch (error) {
        console.error("Error fetching followers:", error);
        throw new Error("Failed to fetch followers. Please try again later.");
    }
}
