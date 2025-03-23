import axios from "axios";
import ENVVARS from "@/utils/config/config";

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  _id: string;
  username: string;
  fullname: string;
  email: string;
}

export const loginUser = async ({ email, password }: LoginData): Promise<LoginResponse> => {
  try {
    const { data } = await axios.post<LoginResponse>(
      `${ENVVARS.API_BASE_URL}/auth/login`,
      { email, password },
      { withCredentials: true } // Quan trọng! Để gửi & nhận cookie
    );

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Lỗi đăng nhập!");
    }
    throw new Error("Đã xảy ra lỗi không xác định!");
  }
};