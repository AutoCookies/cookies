import axios from "axios";
import { ENV_VARS } from "@/lib/envVars";

// Define the types for the response and error
interface BanHistory {
    _id: string;
    user: string;
    admin: string;
    reason: string;
    duration: number;
    banExpiresAt: string;
    createdAt: string;
}

interface BanUserResponse {
    message: string;
    banRecord: BanHistory;
}

interface BanUserError {
    error: string;
}

// The function to call the banUser API
export const handleBanUser = async (userId: string, duration: number, reason: string): Promise<BanUserResponse | BanUserError> => {
    try {
        // Make the API call to ban the user
        const response = await axios.post(`${ENV_VARS.API_ROUTE}/admin/users/${userId}/ban`, 
            {
                duration, // Thời gian ban
                reason // Lý do ban
            }, 
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true, // Use this instead of `credentials: "include"`
            }
        );

        // Return the success response
        return response.data;
    } catch (error: any) {
        // Handle the error and return the error message
        if (error.response) {
            // Server responded with a status other than 200-299
            return { error: error.response.data.error || "Có lỗi xảy ra!" };
        } else {
            // No response received or other errors
            return { error: error.message || "Có lỗi xảy ra!" };
        }
    }
};

