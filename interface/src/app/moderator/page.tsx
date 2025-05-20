"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/moderator/postPage.module.css";
import { handleGetAllPosts } from "@/utils/moderator/handleGetAllPosts";
import { handleGetAllSharePosts } from "@/utils/moderator/handleGetAllSharePosts";
import { handleDeletePost } from "@/utils/moderator/handleDeletePost";
import { handleDeleteSharePost } from "@/utils/moderator/handleDeleteSharePost";
import { handleSendLog } from "@/utils/logs/handleSendLog";
import { ENV_VARS } from "@/lib/envVars";

export type UserType = {
  _id: string;
  username: string;
  email: string;
};

export type PostType = {
  _id: string;
  user: UserType;
  title: string;
  content: string;
  visibility: string;
  createdAt: string;
  likesCount: number;
  commentCount: number;
  image?: string;
};

export type OriginalPostType = {
  _id: string;
  title: string;
  content: string;
  visibility: string;
  createdAt: string;
  likesCount: number;
  commentCount: number;
  image?: string;
};

export type SharePostType = {
  _id: string;
  user: UserType;
  originalPost: OriginalPostType;
  originalPostModel: "Post" | "SharePost";
  caption: string;
  commentCount: number;
  likesCount: number;
  visibility: string;
  createdAt: string;
};

export default function ModeratorPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "shareposts">("posts");
  const [posts, setPosts] = useState<PostType[]>([]);
  const [sharePosts, setSharePosts] = useState<SharePostType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

  // Load Posts or SharePosts when activeTab changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        if (activeTab === "posts") {
          const allPosts = await handleGetAllPosts();
          setPosts(allPosts);
        } else {
          const allSharePosts = await handleGetAllSharePosts();
          setSharePosts(allSharePosts);
        }
      } catch (err: any) {
        setError(err.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Delete handlers
  const onDeletePost = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này không?")) return;
    try {
      await handleDeletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      alert("Xóa bài viết thành công");

      await handleSendLog({
        type: "auth",
        level: "info",
        message: `Người dùng ${data.email} (${data.role}) đã xóa bài viết ${id}`,
        user: { _id: data._id, email: data.email, role: data.role },
        metadata: {
          loginTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });

    } catch (err: any) {
      alert("Xóa thất bại: " + err.message);
    }
  };

  const onDeleteSharePost = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết chia sẻ này không?")) return;
    try {
      await handleDeleteSharePost(id);
      setSharePosts((prev) => prev.filter((p) => p._id !== id));
      alert("Xóa bài viết chia sẻ thành công");

      await handleSendLog({
        type: "auth",
        level: "info",
        message: `Người dùng ${data.email} (${data.role}) đã xóa bài viết chia sẻ ${id}`,
        user: { _id: data._id, email: data.email, role: data.role },
        metadata: {
          loginTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });
      
    } catch (err: any) {
      alert("Xóa thất bại: " + err.message);
    }
  };

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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Moderator - Duyệt bài viết</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "posts" ? styles.active : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Bài viết
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "shareposts" ? styles.active : ""}`}
          onClick={() => setActiveTab("shareposts")}
        >
          Bài viết chia sẻ
        </button>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className={styles.error}>Lỗi: {error}</p>}

      {!loading && !error && (
        <div className={styles.listContainer}>
          {activeTab === "posts" && posts.length === 0 && <p>Không có bài viết nào.</p>}
          {activeTab === "shareposts" && sharePosts.length === 0 && <p>Không có bài viết chia sẻ nào.</p>}

          {activeTab === "posts" &&
            posts.map((post) => (
              <div key={post._id} className={styles.postCard}>
                {post.image && (
                  <div className={styles.imageWrapper}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className={styles.postImage}
                    />
                  </div>
                )}
                <h3>{post.title}</h3>
                <p className={styles.postMeta}>
                  Người đăng: <strong>{post.user.username}</strong> | Ngày tạo:{" "}
                  {new Date(post.createdAt).toLocaleString()} | Visibility: {post.visibility}
                </p>
                <p>{post.content.slice(0, 150)}…</p>
                <p>
                  Likes: {post.likesCount} | Comments: {post.commentCount}
                </p>
                <button
                  className={styles.deleteButton}
                  onClick={() => onDeletePost(post._id)}
                >
                  Xóa bài viết
                </button>
              </div>
            ))}

          {activeTab === "shareposts" &&
            sharePosts.map((sharePost) => (
              <div key={sharePost._id} className={styles.postCard}>
                {sharePost.originalPost?.image && (
                  <div className={styles.imageWrapper}>
                    <img
                      src={sharePost.originalPost.image}
                      alt={sharePost.originalPost.title}
                      className={styles.postImage}
                    />
                  </div>
                )}
                <h3>Caption: {sharePost.caption || "(Không có caption)"}</h3>
                <p className={styles.postMeta}>
                  Người chia sẻ: <strong>{sharePost.user.username}</strong> | Ngày chia sẻ:{" "}
                  {new Date(sharePost.createdAt).toLocaleString()} | Visibility: {sharePost.visibility}
                </p>
                <p>
                  <strong>Bài viết gốc:</strong>{" "}
                  {sharePost.originalPost?.title
                    ? `${sharePost.originalPost.title} - ${sharePost.originalPost.content?.slice(
                      0,
                      100
                    )}…`
                    : "(Bài viết gốc không tồn tại)"}
                </p>
                <p>
                  Likes: {sharePost.likesCount} | Comments: {sharePost.commentCount}
                </p>
                <button
                  className={styles.deleteButton}
                  onClick={() => onDeleteSharePost(sharePost._id)}
                >
                  Xóa bài viết chia sẻ
                </button>
              </div>
            ))}

        </div>
      )}
    </div>
  );
}
