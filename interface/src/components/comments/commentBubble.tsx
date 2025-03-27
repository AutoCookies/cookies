import React from "react";
import styles from "./styles/commentBubble.module.css";

interface CommentProps {
  user?: {
    username?: string;
    profilePicture?: string;
  };
  content?: string;
  likeCount?: number;
  createdAt?: string;
}

const CommentBubble: React.FC<CommentProps> = ({ user, content, likeCount, createdAt }) => {
  return (
    <div className={styles.commentBubble}>
      <img
        src={user?.profilePicture || "/default-avatar.jpg"}
        alt="User Avatar"
        className={styles.avatar}
      />
      <div className={styles.commentContent}>
        <div className={styles.userInfo}>
          <span className={styles.username}>{user?.username || "Ẩn danh"}</span>
          <span className={styles.timestamp}>
            {createdAt
              ? new Intl.DateTimeFormat("vi-VN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(createdAt))
              : "Không rõ thời gian"}
          </span>
        </div>
        <p className={styles.text}>{content || "Không có nội dung."}</p>
        <div className={styles.commentActions}>
          <span>💖 {likeCount ?? 0} Likes</span>
        </div>
      </div>
    </div>
  );
};