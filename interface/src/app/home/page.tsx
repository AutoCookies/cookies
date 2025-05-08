"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAllPosts } from "@/utils/posts/fetchAllPosts";
import PostCard from "@/components/posts/PostCard";
import SharePostCard from "@/components/posts/SharePostCard";
import CreatePostModal from "@/components/posts/CreatePostModal";
import styles from "@/styles/home/postPage.module.css";
import { ENV_VARS } from "@/lib/envVars";
import { useRouter } from 'next/navigation';

export default function PostPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const lastFetchedPage = useRef(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const router = useRouter();

  const fetchPosts = useCallback(async (pageNumber: number, forceRefresh = false) => {
    if ((!hasMore || loading || lastFetchedPage.current === pageNumber) && !forceRefresh) return;

    setLoading(true);
    setError("");

    try {
      const { data, error } = await getAllPosts(pageNumber, 10);
      if (error) throw new Error(error);

      setPosts(prev => {
        if (!forceRefresh && pageNumber !== 1) {
          const uniquePosts = new Map(prev.map(post => [post._id, post]));
          data.forEach((post: any) => uniquePosts.set(post._id, post));
          return Array.from(uniquePosts.values());
        }
        return data;
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
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${ENV_VARS.API_ROUTE}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setData(data);
          setCurrentUserId(data._id.toString());
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

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

  const handleUsernameClick = (userId: string) => {
    router.push(`/home/${userId}`);
  };

  const handlePostCreated = useCallback((newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
    refreshPosts();
  }, []);

  const refreshPosts = useCallback(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Posts</h1>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
        >
          + Tell Your Feeling
        </button>
      </div>

      {error && <p className={styles.error}>Lỗi: {error}</p>}

      <CreatePostModal
        data={data}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />

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
                onUsernameClick={handleUsernameClick}
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
                onUsernameClick={handleUsernameClick}
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