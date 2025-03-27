import React, { useState, useEffect } from "react";
import styles from "./styles/commentBubble.module.css";
import { handleLikeComment } from "@/utils/comments/handleLikeComments";

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
  onDeleteComment: () => void; // Add delete handler
  onEditComment: () => void; // Add edit handler
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
  onEditComment
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleLikeClick = async () => {
    try {
      const data = await handleLikeComment(id, liked);
      if (data) {
        setLiked(prev => !prev);
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
    try {
      await onEditComment();
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

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
          <div className={styles["comment-menu"]}>
            <button
              className={styles["more-button"]}
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </button>
            {showMenu && (
              <div className={styles["menu-dropdown"]}>
                <button onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}>
                  Edit
                </button>
                <button onClick={handleDelete}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className={styles["edit-container"]}>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={styles["edit-textarea"]}
            />
            <div className={styles["edit-buttons"]}>
              <button onClick={handleEdit}>Save</button>
              <button onClick={() => {
                setIsEditing(false);
                setEditedContent(content);
              }}>Cancel</button>
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