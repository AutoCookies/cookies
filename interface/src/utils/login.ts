import axios from 'axios';
import CONFIG from "@/utils/config";


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
    const { data } = await axios.post<LoginResponse>(`${CONFIG.API_BASE_URL}/auth/login`, { email, password });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Lỗi đăng nhập!');
    }
    throw new Error('Đã xảy ra lỗi không xác định!');
  }
};
