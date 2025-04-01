import { ENV_VARS } from "@/lib/envVars";
import { cookies } from "next/headers";

export const handleAuthMe = async () => {  
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("jwt-token")?.value; // Lấy token từ cookies server-side
        if (!token) {
            console.log("No token found in cookies");
            return { error: "Unauthorized access - No token" };
        }

        const respose = await fetch(`${ENV_VARS.API_ROUTE}/auth/me`, {
            method: "GET",
            credentials: "include", // QUAN TRỌNG: Gửi cookie kèm request
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })

        if (!respose.ok) {
            console.log("Response error:", respose.status, respose.statusText);
            return { auhtError: `Error: ${respose.status}` };
        }
        const authData = await respose.json();
        return { authData };

    } catch (error) {
        console.log("Error in handleAuthMe:", error);
        throw error; // Re-throw the error to be handled by the calling function
    }
}