import React, { useState, useEffect } from "react";
import styles from "./styles/commentBubble.module.css"; // Thêm CSS tùy chỉnh
import { handleLikeComment } from "@/utils/comments/handleLikeComments"; // Nhập hàm handleLikeComment

interface CommentProps {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  user: {
    id: string;
    username: string;
    profilePicture: string;
  };
  isLiked: boolean;
  onLikeChange: () => void; // Hàm callback để thông báo cho component cha khi thay đổi trạng thái like
}

export const CommentBubble: React.FC<CommentProps> = ({ id, content, createdAt, likeCount, user, isLiked, onLikeChange }) => {
  const [liked, setLiked] = useState(isLiked); // Trạng thái của nút like

  const handleLikeClick = async () => {
    try {
      console.log("isLiked state before click:", liked); // Log trạng thái liked trước khi click
      // Gọi API để like comment
      const data = await handleLikeComment(id, liked);

      // Nếu like thành công, cập nhật trạng thái liked
      if (data) {
        setLiked((prevLiked) => !prevLiked); // Chuyển đổi trạng thái liked
        onLikeChange(); // Gọi callback để fetch lại comment từ component cha
      }
    } catch (error) {
      console.error("Lỗi khi like bình luận:", error);
    }
  };

  useEffect(() => {
    console.log("isLiked prop in CommentBubble:", isLiked); // Log giá trị isLiked mỗi khi prop thay đổi
  }, [isLiked]);

  return (
    <div className={styles["comment-bubble"]}>
      <img
        src={user.profilePicture || "/default-avatar.jpg"}
        alt="User Avatar"
        className={styles["comment-avatar"]}
      />
      <div className={styles["comment-content"]}>
        <strong>{user.username}</strong>
        <p>{content}</p>
        <small>{new Date(createdAt).toLocaleString()}</small>

        {/* Nút Like */}
        <div className={styles["like-section"]}>
          <button
            className={`${styles["like-button"]} ${liked ? styles.liked : ""}`}
            onClick={handleLikeClick}
          >
            <img
              src="/svg/like-svgrepo-com.svg"
              alt="Like"
              className={liked ? styles["liked-icon"] : styles["like-icon"]}
            />
          </button>
          <span>{likeCount} Likes</span>
        </div>
      </div>
    </div>
  );
};
