import React, { useState } from "react";
import styles from "./styles/postCard.module.css";
import { ENV_VARS } from "../../config/envVars";

interface PostProps {
  postId: string;
  title: string;
  content: string;
  image: string | null;
  likesCount: number;
  commentCount: number;
  isLiked: boolean;
  user: {
    username: string;
    profilePicture: string;
  };
  onLike: () => void;
}

const PostCard: React.FC<PostProps> = ({
  postId,
  title,
  content,
  image,
  likesCount,
  commentCount,
  isLiked,
  user,
  onLike,
}) => {
  const [liked, setLiked] = useState(isLiked);

  const handleLike = async () => {
    try {
      console.log(`Like bài viết: ${postId}`);

      const response = await fetch(`${ENV_VARS.API_ROUTE}/likes/post/${postId}/like`, {
        method: liked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Không thể like bài viết!");
      }

      console.log("Like thành công!");

      setLiked((prev) => !prev);
      onLike();
    } catch (error) {
      console.error("Lỗi khi like bài viết:", error);
    }
  };

  return (
    <div className={styles["post-card"]}>
      {/* Header - User info */}
      <div className={styles["post-card-header"]}>
        <img
          src={user.profilePicture || "/default-avatar.jpg"}
          alt="User Avatar"
          className={styles["user-avatar"]}
        />
        <span className={styles.username}>{user.username}</span>
      </div>

      {/* Body - Post content */}
      <div className={styles["post-card-body"]}>
        <h3>{title}</h3>
        <p>{content}</p>

        {/* Hiển thị ảnh nếu có */}
        {image && <img src={image} alt="Post" className={styles["post-image"]} />}
      </div>

      {/* Footer - Actions */}
      <div className={styles["post-card-footer"]}>
        <div className={styles.actions}>
          <p style={{ color: liked ? "#ff4081" : "#333" }}>
            <strong>{likesCount}</strong> Likes
          </p>
          <p>
            <strong>{commentCount}</strong> Comments
          </p>
        </div>
        <div className={styles.buttons}>
          <button className={styles["icon-button"]} onClick={handleLike}>
            <img
              src="/svg/like-svgrepo-com.svg"
              alt="Like"
              className={liked ? styles.liked : ""}
            />
          </button>
          <button className={styles["icon-button"]}>
            <img src="/svg/information-svgrepo-com.svg" alt="Comment" />
          </button>
          <button className={styles["icon-button"]}>
            <img src="/svg/forward-svgrepo-com.svg" alt="Share" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
