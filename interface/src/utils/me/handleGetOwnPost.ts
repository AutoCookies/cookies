import { ENV_VARS } from '@/lib/envVars';

export const handleGetOwnPosts = async (page = 1, limit = 10) => {
    try {
        const response = await fetch(
            `${ENV_VARS.API_ROUTE}/posts/getown?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return { data: [], error: errorData?.message || "Có lỗi xảy ra khi lấy dữ liệu." };
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Trả về data.posts thay vì data
        return { 
            data: Array.isArray(data.posts) ? data.posts : [], 
            error: "" 
        };
    } catch (err: any) {
        console.error('Fetch error:', err);
        return { data: [], error: err.message || "Có lỗi xảy ra." };
    }
};