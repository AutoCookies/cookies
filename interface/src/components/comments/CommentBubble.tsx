import React, { useState, useEffect } from "react";
import styles from "./styles/commentBubble.module.css";
import { handleLikeComment } from "@/utils/comments/handleLikeComments";
import { ENV_VARS } from "@/config/envVars";
import { handleDeleteComment } from "@/utils/comments/hadnleDeleteComments";

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
  onDeleteComment: () => void; // Callback khi xóa comment
  onEditComment: () => void; // Callback khi chỉnh sửa comment
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lấy thông tin user hiện tại
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${ENV_VARS.API_ROUTE}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data._id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLikeClick = async () => {
    try {
      await handleLikeComment(id, liked);
      setLiked(prev => !prev);
      onLikeChange();
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

/*************  ✨ Codeium Command 🌟  *************/
  /**
   * Handles the delete click on the comment menu
   * @remarks
   * 1. Set `isDeleting` to true to show the loading state
   * 2. Calls the `handleDeleteComment` function to delete the comment
   * 3. Calls the `onDeleteComment` callback function to notify the parent
   * 4. Set `isDeleting` to false to hide the loading state
   * 5. Set `showMenu` to false to hide the menu
   */
  const handleDeleteClick = async () => {
    try {
      setIsDeleting(true);
      await handleDeleteComment(id);
      onDeleteComment();
    } catch (error) {
      console.error("Error in delete callback:", error);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };
/******  20a235b2-4be3-420a-b716-987e0b52afe1  *******/

  const handleEditSave = () => {
    onEditComment(); // Gọi callback chỉnh sửa
    setIsEditing(false);
  };

  const isCurrentUserComment = currentUserId && user.id === currentUserId;

  return (
    <div className={styles["comment-bubble"]}>
      <img
        src={user.profilePicture || "/default-avatar.jpg"}
        alt="User Avatar"
        className={styles["comment-avatar"]}
      />

      <div className={styles["comment-content"]}>
        <div className={styles["comment-header"]}>
          <strong>{user.username}</strong>
          
          {isCurrentUserComment && (
            <div className={styles["comment-menu"]}>
              <button 
                className={styles["more-button"]}
                onClick={() => setShowMenu(!showMenu)}
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "⋮"}
              </button>
              
              {showMenu && (
                <div className={styles["menu-dropdown"]}>
                  <button onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}>
                    Chỉnh sửa
                  </button>
                  <button 
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className={styles["delete-button"]}
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className={styles["edit-container"]}>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={styles["edit-textarea"]}
            />
            <div className={styles["edit-buttons"]}>
              <button onClick={handleEditSave}>Lưu</button>
              <button onClick={() => {
                setIsEditing(false);
                setEditedContent(content);
              }}>
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <p>{content}</p>
        )}

        <small>{new Date(createdAt).toLocaleString()}</small>

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