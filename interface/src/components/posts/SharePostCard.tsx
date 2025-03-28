import React, { useState, useEffect, useRef } from "react";
import styles from "./styles/sharePostCard.module.css";
import SharePostModal from "./sharePostModal";
import { handleLike } from "@/utils/posts/handleLike";
import { handleShare } from "@/utils/posts/handleSharePosts";
import { handleDeletePost } from "@/utils/posts/handleDeletePost";
import CommentSection from "../comments/commentSection";
import { ENV_VARS } from "@/config/envVars";
import { handleUpdateSharePost } from "@/utils/posts/handleUpdateSharePost";
import EditSharePostModal from './EditSharePostModal';

interface SharePostProps {
  sharePostId: string;
  caption: string;
  user: {
    _id: string;
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
  onShare: () => void;
  onChangeComment: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const SharePostCard: React.FC<SharePostProps> = ({
  sharePostId,
  caption,
  user,
  likesCount,
  commentCount,
  isLiked,
  originalPost,
  onLike,
  onShare,
  onChangeComment,
  onDelete,
  onEdit,
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLikeSharePost = async () => {
    try {
      setLiked(prev => !prev);
      await handleLike(sharePostId, liked, onLike);
    } catch (error) {
      setLiked(prev => !prev);
      console.error("Failed to like post:", error);
    }
  };

  const handleSharePost = (caption: string, visibility: "public" | "private" | "friends") => {
    handleShare(sharePostId, caption, visibility, onShare);
  };

  const toggleComments = () => {
    setShowComments(prev => !prev);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { success } = await handleDeletePost(sharePostId, () => {
      onDelete?.(); // Gọi callback khi xóa thành công
    }, (error) => {
      console.error("Lỗi khi xóa bài viết:", error);
    });
    setIsDeleting(false);
    setShowDropdown(false);
  };

  const handleSaveEdit = async (newCaption: string) => {
    try {
      const { success } = await handleUpdateSharePost(sharePostId, {
        caption: newCaption
      });

      if (success) {
        setIsEditing(false);
        onEdit?.(); // Notify parent component
      }
    } catch (error) {
      console.error("Update failed:", error);
      throw error; // Let the modal handle the error display
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
          setCurrentUserId(data._id.toString());
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles["share-post-card"]}>
      {/* Header - User who shared the post */}
      <div className={styles["share-header"]}>
        <div className={styles["user-info-container"]}>
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

        {currentUserId === user?._id && (
          <div className={styles["dropdown-wrapper"]} ref={dropdownRef}>
            <button
              className={styles["dropdown-toggle"]}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span>Đang xóa...</span>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {showDropdown && (
              <div className={styles["dropdown-menu"]}>
                <button
                  className={styles["dropdown-item"]}
                  onClick={() => {
                    setShowDropdown(false);
                    setIsEditing(true);
                  }}
                >
                  Chỉnh sửa
                </button>
                <button
                  className={`${styles["dropdown-item"]} ${styles["delete-item"]}`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Original post */}
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
            <p style={{ color: originalPost.isLiked ? "#ff4081" : "#333" }}>
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
        <div className={styles["actions"]}>
          <p style={{ color: liked ? "#ff4081" : "#333" }}>
            <strong>{likesCount}</strong> Likes
          </p>
          <p>
            <strong>{commentCount}</strong> Comments
          </p>
        </div>
        <div className={styles["action-buttons"]}>
          <button
            className={`${styles["action-button"]} ${liked ? styles["liked"] : ""}`}
            onClick={handleLikeSharePost}
          >
            {liked ? "Đã thích" : "Thích"}
          </button>
          <button
            className={styles["action-button"]}
            onClick={toggleComments}
          >
            Bình luận
          </button>
          <button
            className={styles["action-button"]}
            onClick={() => setShowShareModal(true)}
          >
            Chia sẻ
          </button>
        </div>
      </div>

      {/* Comment section */}
      {showComments && (
        <CommentSection
          postId={sharePostId}
          currentUserId={currentUserId}
          onCommentAdd={onChangeComment}
        />
      )}

      {/* Share modal */}
      {showShareModal && (
        <SharePostModal
          postId={sharePostId}
          onClose={() => setShowShareModal(false)}
          onShare={handleSharePost}
        />
      )}

      {isEditing && (
        <EditSharePostModal
          isOpen={isEditing}
          initialCaption={caption}
          onSave={handleSaveEdit}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default SharePostCard;