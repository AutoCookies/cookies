// utils/admin/handleUnBanUser.ts

import axios from "axios";
import { ENV_VARS } from "@/lib/envVars";

export const handleUnBanUser = async (userId: string): Promise<boolean> => {
    try {
        const res = await axios.post(
            `${ENV_VARS.API_ROUTE}/admin/users/${userId}/unban`,
            {}, // POST body là rỗng vì `userId` lấy từ URL, `adminId` từ token
            {
                withCredentials: true, // Đảm bảo gửi kèm cookie xác thực
            }
        );

        if (res.status === 200) {
            return true;
        } else {
            console.error("Lỗi khi mở khóa người dùng:", res.data);
            return false;
        }
    } catch (error: any) {
        console.error("Lỗi khi gọi API unban:", error.response?.data || error.message);
        return false;
    }
};
