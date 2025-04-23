import { toast } from "react-hot-toast";
import { ENV_VARS } from "../../lib/envVars";

export const handleDeleteUser = async (userId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${ENV_VARS.API_ROUTE}/admin/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            cache: "no-cache",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to delete user");
        }

        const data = await response.json();
        toast.success(data.message || "Xóa người dùng thành công!");
        return true;
    } catch (error: any) {
        console.error("Failed to delete user:", error);
        toast.error(error.message || "Xóa người dùng thất bại!");
        return false;
    }
};
