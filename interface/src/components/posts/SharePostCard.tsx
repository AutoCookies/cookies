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
  visibility: "public" | "private" | "friends";
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
  visibility,
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


  const renderVisibilityIcon = (visibility: string) => {
    const iconProps = {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "#666",
      strokeWidth: "2",
      className: styles["visibility-icon"],
    };

    switch (visibility) {
      case "public":
        return (
          <svg {...iconProps}>
            <title>Công khai</title>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case "friends":
        return (
          <svg {...iconProps}>
            <title>Bạn bè</title>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M17 11h3m-1.5 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 0v4" />
          </svg>
        );
      case "private":
      default:
        return (
          <svg {...iconProps}>
            <title>Riêng tư</title>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
    }
  };

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
            <span className={styles["visibility-text"]} data-visibility={visibility}>
              {visibility === "public" && "Public"}
              {visibility === "private" && "Private"}
              {visibility === "friends" && "Friends"}
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
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={liked ? "#ff4081" : "none"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                stroke={liked ? "#ff4081" : "#333"}
                strokeWidth="2"
              />
            </svg>
            {liked ? "Đã thích" : "Thích"}
          </button>
          <button
            className={styles["action-button"]}
            onClick={toggleComments}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                stroke="#333"
                strokeWidth="2"
              />
            </svg>
            Bình luận
          </button>
          <button
            className={styles["action-button"]}
            onClick={() => setShowShareModal(true)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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