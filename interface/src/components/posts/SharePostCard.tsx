import React, { useState } from "react";
import styles from "./styles/sharePostCard.module.css";
import { ENV_VARS } from "@/config/envVars";

interface SharePostProps {
  sharePostId: string;
  caption: string;
  user: {
    username: string;
    profilePicture: string;
  };
  likesCount: number;
  commentCount: number;
  isLiked: boolean;
  originalPost: {
    postId: string;
    title: string;
    content: string;
    image: string | null;
    user: {
      username: string;
      profilePicture: string;
    };
    likesCount: number;
    commentCount: number;
    isLiked: boolean;
  };
  onLike: () => void;
}

const SharePostCard: React.FC<SharePostProps> = ({
  sharePostId,
  caption,
  user,
  likesCount,
  commentCount,
  isLiked,
  originalPost,
  onLike
}) => {
  const [liked, setLiked] = useState(isLiked);

  const handleLike = async () => {
    try {
      console.log(`Like bài viết: ${sharePostId}`);

      const response = await fetch(`${ENV_VARS.API_ROUTE}/likes/post/${sharePostId}/like`, {
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
    <div className={styles["share-post-card"]}>
      {/* Người dùng đã chia sẻ bài viết */}
      <div className={styles["share-header"]}>
        <img
          src={user?.profilePicture || "/default-avatar.jpg"}
          alt="User Avatar"
          className={styles["share-avatar"]}
        />
        <div className={styles["share-info"]}>
          <span className={styles["share-user"]}>
            <strong>{user?.username || "Người dùng không xác định"}</strong>
          </span>
          <p className={styles["share-caption"]}>{caption}</p>
        </div>
      </div>

      {/* Bài đăng gốc */}
      <div className={styles["post-card"]}>
        <div className={styles["post-card-header"]}>
          <img
            src={originalPost.user.profilePicture || "/default-avatar.jpg"}
            alt="User Avatar"
            className={styles["post-avatar"]}
          />
          <span className={styles["post-username"]}>{originalPost.user.username}</span>
        </div>

        <div className={styles["post-card-body"]}>
          <h3>{originalPost.title}</h3>
          <p>{originalPost.content}</p>
          {originalPost.image && (
            <img src={originalPost.image} alt="Post" className={styles["post-image"]} />
          )}
        </div>

        <div className={styles["post-card-footer"]}>
          <div className={styles["actions"]}>
            <p>
              <strong>{originalPost.likesCount}</strong> Likes
            </p>
            <p>
              <strong>{originalPost.commentCount}</strong> Comments
            </p>
          </div>
        </div>
      </div>

      {/* Footer của bài chia sẻ */}
      <div className={styles["share-footer"]}>
        <p>
          <strong>{likesCount}</strong> Likes <strong>{commentCount}</strong> Comments
        </p>
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

export default SharePostCard;
