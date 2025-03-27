import React, { useState, useEffect } from "react";
import styles from "./styles/commentBubble.module.css";
import { handleLikeComment } from "@/utils/comments/handleLikeComments";
import { ENV_VARS } from "@/config/envVars";
import { handleDeleteComment } from "@/utils/comments/hadnleDeleteComments";
import { handleEditComment } from "@/utils/comments/handleEditComment";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingLoading, setIsEditingLoading] = useState(false); // Thêm state cho trạng thái loading khi edit

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

  // Hàm xử lý khi lưu chỉnh sửa comment
  const handleEditSave = async () => {
    try {
      setIsEditingLoading(true); // Bật trạng thái loading
      
      // Gọi API chỉnh sửa comment với nội dung mới
      await handleEditComment({ 
        commentId: id, 
        newContent: editedContent 
      });
      
      // Gọi callback để component cha fetch lại dữ liệu
      onEditComment();
    } catch (error) {
      console.error("Error while editing:", error);
      // Có thể thêm hiển thị thông báo lỗi ở đây
    } finally {
      setIsEditingLoading(false); // Tắt trạng thái loading
      setIsEditing(false); // Đóng chế độ chỉnh sửa
    }
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
                disabled={isDeleting || isEditingLoading}
              >
                {isDeleting ? "Đang xóa..." : "⋮"}
              </button>
              
              {showMenu && !isEditing && (
                <div className={styles["menu-dropdown"]}>
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    disabled={isEditingLoading}
                  >
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
              disabled={isEditingLoading}
            />
            <div className={styles["edit-buttons"]}>
              <button 
                onClick={handleEditSave}
                disabled={isEditingLoading || !editedContent.trim()}
              >
                {isEditingLoading ? "Đang lưu..." : "Lưu"}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(content);
                }}
                disabled={isEditingLoading}
              >
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
            disabled={isEditing || isDeleting || isEditingLoading}
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