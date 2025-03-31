// utils/posts/handleCreatePost.ts
import { ENV_VARS } from '@/lib/envVars';

// Define visibility types
export type PostVisibility = 'public' | 'friends' | 'private';

interface CreatePostParams {
    title: string;
    content: string;
    image?: File | null;
    visibility?: PostVisibility;
}

interface CreatePostResponse {
    success: boolean;
    post?: Post;
    message?: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    image?: string;
    visibility: PostVisibility;
    user: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export const handleCreatePost = async (
    postData: CreatePostParams,
    onSuccess?: (post: Post) => void,
    onError?: (error: string) => void
): Promise<CreatePostResponse> => {
    try {
        // Validate required fields
        if (!postData.title.trim()) {
            throw new Error('Tiêu đề không được để trống');
        }

        if (!postData.content.trim() && !postData.image) {
            throw new Error('Bài viết phải có nội dung hoặc ảnh');
        }

        // Set default visibility if not provided
        const visibility = postData.visibility || 'public';

        // Prepare FormData
        const formData = new FormData();
        formData.append('title', postData.title);
        formData.append('content', postData.content);
        formData.append('visibility', visibility);

        if (postData.image) {
            formData.append('image', postData.image);
        }

        // Make API request
        const response = await fetch(`${ENV_VARS.API_ROUTE}/posts/create`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        // Handle response
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await response.text();
            throw new Error(
                errorText.includes('<!DOCTYPE html>')
                    ? 'Lỗi hệ thống: Máy chủ trả về trang lỗi'
                    : errorText || 'Lỗi không xác định từ máy chủ'
            );
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Tạo bài viết thất bại');
        }

        // Validate response data
        if (!data.post || !data.post._id) {
            throw new Error('Dữ liệu bài viết không hợp lệ từ máy chủ');
        }

        // Success case
        if (onSuccess) {
            onSuccess(data.post);
        }

        return {
            success: true,
            post: data.post,
        };
    } catch (error) {
        console.error('Error creating post:', error);

        const errorMessage = error instanceof Error
            ? error.message
            : 'Đã xảy ra lỗi khi tạo bài viết';

        if (onError) {
            onError(errorMessage);
        }

        return {
            success: false,
            message: errorMessage,
        };
    }
};