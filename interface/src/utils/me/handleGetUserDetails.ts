import { ENV_VARS } from "@/lib/envVars";

export const handleGetUserDetails = async () => {
    try {
        const response = await fetch(`${ENV_VARS.API_ROUTE}/auth/me`, {
            method: "GET",
            credentials: "include",
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            return {
                data: null,
                error: errorData?.message || "Failed to fetch user details"
            };
        }
    
        const data = await response.json();
        return {
            data,
            error: null
        };
    } catch (error: any) {
        return {
            data: null,
            error: error.message || "Network error occurred"
        };
    }
}