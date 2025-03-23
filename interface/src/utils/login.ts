import axios from 'axios';

interface LoginData {
    email: string;
    password: string;
}

export const loginUser = async ({ email, password }: LoginData) => {
    try {
        const response = await axios.post('/api/auth/login', {
            email,
            password,
        });
        
        return response.data; // Trả về dữ liệu từ API (token, user info, v.v.)
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
};
