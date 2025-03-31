'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { handleGetOwnPosts } from "@/utils/me/handleGetOwnPost";
import PostCard from "@/components/posts/PostCard";
import SharePostCard from "@/components/posts/SharePostCard";
import styles from '@/styles/me/personalPage.module.css';

export default function PersonalPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [hasMore, setHasMore] = useState(true);
    const lastFetchedPage = useRef(0);


    const fetchPosts = useCallback(async (pageNumber: number, forceRefresh = false) => {
        if ((!hasMore || loading || lastFetchedPage.current === pageNumber) && !forceRefresh) return;

        setLoading(true);
        setError("");

        try {
            const { data, error } = await handleGetOwnPosts(pageNumber, 10);
            if (error) throw new Error(error);

            // Đảm bảo data là mảng
            const postsData = Array.isArray(data) ? data : [];

            setPosts(prev => {
                if (!forceRefresh && pageNumber !== 1) {
                    const uniquePosts = new Map(prev.map(post => [post._id, post]));
                    postsData.forEach((post: any) => uniquePosts.set(post._id, post));
                    return Array.from(uniquePosts.values());
                }
                return postsData; // Sử dụng postsData đã được kiểm tra
            });

            setHasMore(postsData.length > 0);
            lastFetchedPage.current = pageNumber;
        } catch (error) {
            console.log("Error: ", error)
            setPosts([]); // Reset về mảng rỗng nếu có lỗi
        } finally {
            setLoading(false);
        }
    }, [hasMore, loading]);

    useEffect(() => {
        const fetchInitialData = async () => {
            await fetchPosts(page);
        };

        fetchInitialData();
    }, [page]);

    const refreshPosts = useCallback(() => {
        fetchPosts(1, true);
    }, [fetchPosts]);

    const handleCommentChange = useCallback((postId: string) => {
        setPosts(prev => prev.map(post => {
            if (post._id === postId) {
                return { ...post, commentCount: post.commentCount + 1 };
            }
            if (post.originalPost?._id === postId) {
                return {
                    ...post,
                    originalPost: {
                        ...post.originalPost,
                        commentCount: post.originalPost.commentCount + 1
                    }
                };
            }
            return post;
        }));
    }, []);

    useEffect(() => {
        let timeout: any = null;

        const handleScroll = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (
                    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
                    !loading &&
                    hasMore
                ) {
                    setPage((prev) => (hasMore ? prev + 1 : prev));
                }
            }, 200);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (timeout) clearTimeout(timeout);
        };
    }, [loading, hasMore]);

    return (
        <div className={styles.container}>
            <div className={styles.posts}>
                {posts.map((post) => (
                    <div key={post._id}>
                        {post.originalPost ? (
                            <SharePostCard
                                sharePostId={post._id}
                                caption={post.caption}
                                user={post.user}
                                likesCount={post.likesCount}
                                commentCount={post.commentCount}
                                isLiked={post.isLiked}
                                originalPost={{
                                    postId: post.originalPost._id,
                                    title: post.originalPost.title,
                                    content: post.originalPost.content,
                                    image: post.originalPost.image,
                                    user: post.originalPost.user,
                                    likesCount: post.originalPost.likesCount,
                                    commentCount: post.originalPost.commentCount,
                                    isLiked: post.originalPost.isLiked,
                                }}
                                visibility={post.visibility}
                                onLike={refreshPosts}
                                onShare={refreshPosts}
                                onDelete={refreshPosts}
                                onEdit={refreshPosts}
                                onChangeComment={() => handleCommentChange(post._id)}
                            />
                        ) : (
                            <PostCard
                                postId={post._id}
                                title={post.title}
                                content={post.content}
                                image={post.image}
                                likesCount={post.likesCount}
                                commentCount={post.commentCount}
                                isLiked={post.isLiked}
                                user={post.user}
                                visibility={post.visibility}
                                onLike={refreshPosts}
                                onShare={refreshPosts}
                                onDelete={refreshPosts}
                                onEdit={refreshPosts}
                                onChangeComment={() => handleCommentChange(post._id)}
                            />
                        )}
                    </div>
                ))}
            </div>

            {loading && (
                <div className={styles.loading}>
                    <img src="/assets/loading.gif" alt="Loading..." />
                </div>
            )}

            {!hasMore && <p className={styles.endMessage}>Không còn bài viết nào.</p>}
        </div>
    );
}