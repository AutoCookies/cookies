import React, { useState, useEffect, useRef } from "react";
import styles from "./styles/sharePostCard.module.css";
import SharePostModal from "./sharePostModal";
import { handleLike } from "@/utils/posts/handleLike";
import { handleShare } from "@/utils/posts/handleSharePosts";
import CommentSection from "../comments/commentSection";
import { ENV_VARS } from "@/config/envVars";

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
  onDelete?: () => void;
  onEdit?: () => void;
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
  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleDeletePost = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài chia sẻ này?")) {
      try {
        const response = await fetch(`${ENV_VARS.API_ROUTE}/share/${sharePostId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          onDelete?.();
        } else {
          throw new Error("Không thể xóa bài chia sẻ");
        }
      } catch (error) {
        console.error("Lỗi khi xóa bài chia sẻ:", error);
      }
    }
    setShowDropdown(false);
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

        {/* Dropdown menu */}
        {currentUserId && currentUserId === user._id && (
          <div className={styles["dropdown-container"]} ref={dropdownRef}>
            <button
              className={styles["dropdown-toggle"]}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              aria-label="More options"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <circle cx="12" cy="12" r="1.5"></circle>
                <circle cx="6" cy="12" r="1.5"></circle>
                <circle cx="18" cy="12" r="1.5"></circle>
              </svg>
            </button>

            {showDropdown && (
              <div className={styles["dropdown-menu"]}>
                <button 
                  className={styles["dropdown-item"]}
                  onClick={() => {
                    onEdit?.();
                    setShowDropdown(false);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Chỉnh sửa
                </button>
                <button 
                  className={`${styles["dropdown-item"]} ${styles["delete-item"]}`}
                  onClick={handleDeletePost}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Xóa bài viết
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
    </div>
  );
};

export default SharePostCard;