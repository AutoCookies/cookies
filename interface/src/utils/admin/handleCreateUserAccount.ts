import axios from "axios";
import { ENV_VARS } from "@/lib/envVars";

interface CreateUserAccountPayload {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: string; // bạn có thể mở rộng nếu có thêm role
}

interface CreateUserAccountResponse {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export const handleCreateUserAccount = async (
  payload: CreateUserAccountPayload
): Promise<CreateUserAccountResponse> => {
  try {
    const response = await axios.post<CreateUserAccountResponse>(
      `${ENV_VARS.API_ROUTE}/admin/create`, // hoặc URL tương ứng backend bạn cấu hình
      payload,
      {
        withCredentials: true, // nếu cần gửi cookie
      }
    );

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to create user account";
    throw new Error(message);
  }
};
