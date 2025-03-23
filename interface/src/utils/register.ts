import axios, { AxiosError } from 'axios';
import CONFIG from "@/utils/config";

interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterData): Promise<unknown> => {
  try {
    const response = await axios.post(`${CONFIG.API_BASE_URL}/auth/signup`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại!');
    }
    throw new Error('Có lỗi xảy ra, vui lòng thử lại!');
  }
};
