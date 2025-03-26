"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getAllPosts } from "@/utils/posts/fetchAllPosts";
import PostCard from "../../../components/posts/PostCard";
import SharePostCard from "../../../components/posts/SharePostCard";
import styles from "../../../styles/home/postPage.module.css";

export default function PostPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await getAllPosts();
    if (error) {
      setError(error);
    } else {
      setPosts(data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loading}>
          <img src="/assets/loading.gif" alt="Loading..." />
        </div>
      )}

      {error && <p className={styles.error}>Lỗi: {error}</p>}

      <div className={styles.posts}>
        {posts.map((post) => (
          <div key={post._id}>
            {post._id ? (
              post.originalPost ? (
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
                  onLike={() => fetchPosts()}
                  onShare={() => fetchPosts()}
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
                  onLike={() => fetchPosts()}
                  onShare={() => fetchPosts()}
                />
              )
            ) : (
              <p className="error">Bài viết này không hợp lệ.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
