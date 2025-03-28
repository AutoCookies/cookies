"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAllPosts } from "@/utils/posts/fetchAllPosts";
import PostCard from "../../../components/posts/PostCard";
import SharePostCard from "../../../components/posts/SharePostCard";
import styles from "../../../styles/home/postPage.module.css";

export default function PostPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);
  const lastFetchedPage = useRef(0); // Lưu trạng thái page đã fetch

  const fetchPosts = useCallback(async (pageNumber: number, forceRefresh = false) => {
    if ((!hasMore || loading || lastFetchedPage.current === pageNumber) && !forceRefresh) return;

    setLoading(true);
    setError("");

    try {
      const { data, error } = await getAllPosts(pageNumber, 10);
      if (error) throw new Error(error);

      setPosts(prev => {
        // Chỉ merge dữ liệu khi không force refresh
        if (!forceRefresh && pageNumber !== 1) {
          const uniquePosts = new Map(prev.map(post => [post._id, post]));
          data.forEach((post: any) => uniquePosts.set(post._id, post));
          return Array.from(uniquePosts.values());
        }
        return data; // Trả về dữ liệu mới hoàn toàn khi force refresh
      });

      setHasMore(data.length > 0);
      lastFetchedPage.current = pageNumber;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

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
          setPage((prev) => (hasMore ? prev + 1 : prev)); // Chặn tăng page khi hết dữ liệu
        }
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [loading, hasMore]);


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

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>Lỗi: {error}</p>}

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
                onLike={() => fetchPosts(1, true)}
                onShare={() => fetchPosts(1, true)}
                onDelete={() => fetchPosts(1, true)}
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
                onLike={() => fetchPosts(1, true)}
                onShare={() => fetchPosts(1, true)}
                onDelete={() => fetchPosts(1, true)}
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
