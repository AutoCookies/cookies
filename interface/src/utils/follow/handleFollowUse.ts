import { ENV_VARS } from "@/lib/envVars";

export const handleFollowUser = async (targetUserId: string, isFollowing: boolean) => {
    try {
        const response = await fetch(`${ENV_VARS.API_ROUTE}/follow/${targetUserId}`, {
            method: isFollowing ? "DELETE" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response data:", errorData); // Log the error response data
            throw new Error("Failed to follow user. Please try again later.");
        }

        const data = await response.json();
        console.log("Follow user response data:", data); // Log the response data
        return data; // Assuming data includes updated user info or a success message
    } catch (error) {
        console.error("Error following user:", error);
        throw new Error("Failed to follow user. Please try again later.");
    }
}
