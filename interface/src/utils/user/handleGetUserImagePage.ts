import { cookies } from "next/headers";
import { ENV_VARS } from "@/lib/envVars";

export const handleGetUserImagePage = async (userId: string) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt-token")?.value; // Lấy token từ cookies server-side

    if (!token) {
      console.log("No token found in cookies");
      return { error: "Unauthorized access - No token" };
    }

    const response = await fetch(`${ENV_VARS.API_ROUTE}/user/${userId}/imagePage`, {
      method: "GET",
      credentials: "include", // QUAN TRỌNG: Gửi cookie kèm request
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log("Response error:", response.status, response.statusText);
      return { error: `Error: ${response.status}` };
    }

    const data = await response.json();
    console.log("User data:", data);
    return { data };
  } catch (error) {
    console.error("Error fetching user images:", error);
    return { error: "Failed to fetch user data" };
  }
};
