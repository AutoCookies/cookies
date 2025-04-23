import { toast } from "react-hot-toast";
import { ENV_VARS } from "@/lib/envVars";

interface User {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    followerCount: number;
    followingCount: number;
    isBanned: boolean;
    visibility: string;
}
  

interface GetAllUserResponse {
    total: number;
    page: number;
    limit: number;
    users: User[];
  }

export const handleGetAllUser = async (
    page: number = 1,
    limit: number = 10
    ): Promise<GetAllUserResponse | null> => {
    try {
        const response = await fetch(
        `${ENV_VARS.API_ROUTE}/admin/users?page=${page}&limit=${limit}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            cache: "no-cache",
        }
        );
    
        if (!response.ok) {
        throw new Error("Failed to fetch users");
        }
    
        const data = await response.json();
        return data;
    } catch (error) {
        toast.error("Lỗi khi lấy danh sách người dùng");
        console.error(error);
        return null;
    }
}