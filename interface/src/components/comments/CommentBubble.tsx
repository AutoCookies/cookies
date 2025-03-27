import React, { useState } from "react";
import styles from "./styles/commentBubble.module.css";
import { handleLikeComment } from "@/utils/comments/handleLikeComments";
import {jwtDecode} from "jwt-decode";

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
  onLikeChange: () => void;
  onDeleteComment: () => void;
  onEditComment: () => void;
}

export const CommentBubble: React.FC<CommentProps> = ({
  id,
  content,
  createdAt,
  likeCount,
  user,
  isLiked,
  onLikeChange,
  onDeleteComment,
  onEditComment,
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  // Khúc này là để lấy token ra
  const token = localStorage.getItem("token");
  const decoded = jwtDecode<{ userId: string }>(token);
  console.log("User ID:", decoded.userId);
  const currentUserId = decoded?.userId;

  const handleLikeClick = async () => {
    try {
      const data = await handleLikeComment(id, liked);
      if (data) {
        setLiked((prev) => !prev);
        onLikeChange();
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteComment();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEdit = async () => {
    console.log("This is method")
  };

  return (
    <div className={styles["comment-bubble"]}>
      {/* Avatar người dùng */}
      <img
        src={user.profilePicture || "/default-avatar.jpg"}
        alt="User Avatar"
        className={styles["comment-avatar"]}
      />
      
      <div className={styles["comment-content"]}>
        {/* Tên người dùng và Menu tùy chọn */}
        <div className={styles["comment-header"]}>
          <strong>{user.username}</strong>

          {/* Kiểm tra nếu đây là comment của user hiện tại thì mới hiển thị menu */}
          {user.id === currentUserId && (
            <div className={styles["comment-menu"]}>
              <button
                className={styles["more-button"]}
                onClick={() => setShowMenu((prev) => !prev)}
              >
                ⋮
              </button>

              {/* Menu Xem Thêm */}
              {showMenu && (
                <div className={styles["menu-dropdown"]}>
                  <button onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}>
                    Chỉnh sửa
                  </button>
                  <button onClick={handleDelete} className={styles["delete-button"]}>
                    Xóa
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hiển thị nội dung comment */}
        {isEditing ? (
          <div className={styles["edit-container"]}>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={styles["edit-textarea"]}
            />
            <div className={styles["edit-buttons"]}>
              <button onClick={handleEdit}>Lưu</button>
              <button onClick={() => {
                setIsEditing(false);
                setEditedContent(content);
              }}>Hủy</button>
            </div>
          </div>
        ) : (
          <p>{content}</p>
        )}

        {/* Hiển thị thời gian */}
        <small>{new Date(createdAt).toLocaleString()}</small>

        {/* Nút like */}
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
