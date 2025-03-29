import { ENV_VARS } from '@/config/envVars';

interface Post {
    _id: string;
    user: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    title?: string;
    content?: string;
    image?: string;
    likesCount: number;
    commentCount: number;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
    originalPost?: any; // Hoặc định nghĩa interface cụ thể cho originalPost
    caption?: string;
}

interface ApiResponse {
    message: string;
    posts: {
        posts: Post[];
        total: number;
        page: number;
        limit: number;
    };
}

interface ReturnType {
    data: Post[];
    error: string | null;
}

export const handleGetOwnPosts = async (page = 1, limit = 10): Promise<ReturnType> => {
    try {
        const response = await fetch(
            `${ENV_VARS.API_ROUTE}/posts/getown?page=${page}&limit=${limit}`,
            {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                credentials: "include",
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return { 
                data: [], 
                error: errorData.message || 'Failed to fetch posts' 
            };
        }

        const data: ApiResponse = await response.json();
        
        // Kiểm tra và trả về mảng posts đúng cách
        const postsArray = data?.posts?.posts ?? [];
        
        return {
            data: Array.isArray(postsArray) ? postsArray : [],
            error: null
        };
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};