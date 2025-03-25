"use client";

import React, { useState, useEffect } from 'react';
import { ENV_VARS } from "@/config/envVars";
import PostCard from "../../../components/posts/PostCard";
import SharePostCard from "../../../components/posts/SharePostCard";
import styles from "../../../styles/home/postPage.module.css";

export default function PostPage() {
  const [posts, setPosts] = useState<any[]>([]); // Array to store all posts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const getAllPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${ENV_VARS.API_ROUTE}/posts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData?.message || "Có lỗi xảy ra khi lấy dữ liệu.");
        return;
      }

      const data = await response.json();
      setPosts(data); // Set the posts data to state
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPosts(); // Fetch posts when the component mounts
  }, []);

  return (
    <div className={styles.container}>
      {/* Loading Spinner with GIF */}
      {loading && (
        <div className={styles.loading}>
          <img src="/assets/loading.gif" alt="Loading..." />
        </div>
      )}

      {/* Error message with soft tone */}
      {error && <p className={styles.error}>Lỗi: {error}</p>}

      {/* Posts Container */}
      <div className={styles.posts}>
        {posts.map((post) => (
          <div key={post._id}>
            {post.originalPost ? (
              // Đây là SharePost, vì có trường originalPost
              <SharePostCard
                caption={post.caption}
                user={post.user}
                likesCount={post.likesCount}
                commentCount={post.commentCount}
                originalPost={post.originalPost}
              />
            ) : (
              // Đây là Post bình thường
              <PostCard
                title={post.title}
                content={post.content}
                image={post.image}
                likesCount={post.likesCount}
                commentCount={post.commentCount}
                user={post.user}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
