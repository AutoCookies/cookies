import React, { useState, useEffect, useRef } from "react";
import styles from "./styles/postCard.module.css";
import { handleLike } from "@/utils/posts/handleLike";
import { handleShare } from "@/utils/posts/handleSharePosts";
import CommentSection from "../comments/commentSection";
import SharePostModal from "@/components/posts/sharePostModal";
import { ENV_VARS } from "@/config/envVars";
import { handleDeletePost } from "@/utils/posts/handleDeletePost";
import EditPostModal from "@/components/posts/EditPostModal";

interface PostProps {
  postId: string;
  title: string;
  content: string;
  image: string | null;
  likesCount: number;
  commentCount: number;
  isLiked: boolean;
  user: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  onLike: () => void;
  onShare: () => void;
  onChangeComment: () => void;
  onDelete: () => void;
  onEdit?: () => void;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLikePost = () => {
    handleLike(postId, liked, () => {
      setLiked((prev) => !prev);
      onLike();
    });
  };

  const handleSharePost = (caption: string, visibility: "public" | "private" | "friends") => {
    handleShare(postId, caption, visibility, () => {
      console.log("Đã cập nhật UI sau khi chia sẻ!");
      onShare();
    });
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { success } = await handleDeletePost(postId, () => {
      onDelete?.(); // Gọi callback khi xóa thành công
    }, (error) => {
      console.error("Lỗi khi xóa bài viết:", error);
    });
    setIsDeleting(false);
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isCurrentUser = currentUserId && user._id === currentUserId;

  // console.log(`isCurrentUser: `, isCurrentUser)
  // console.log(`currentUserId: `, currentUserId)
  // console.log(`user.id: `, user._id)

  return (
    <div className={styles["post-card"]}>
      {/* Header - User info */}
      <div className={styles["post-header"]}>
        <div className={styles["user-info"]}>
          <img
            src={user.profilePicture || "/default-avatar.jpg"}
            alt="User Avatar"
            className={styles["user-avatar"]}
          />
          <span className={styles.username}>{user.username}</span>
        </div>

        {isCurrentUser && (
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
                    setShowEditModal(true);
                    setShowDropdown(false);
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

      {/* Body - Post content */}
      <div className={styles["post-body"]}>
        <h3 className={styles["post-title"]}>{title}</h3>
        <p className={styles["post-content"]}>{content}</p>

        {image && (
          <div className={styles["post-image-container"]}>
            <img src={image} alt="Post" className={styles["post-image"]} />
          </div>
        )}
      </div>

      {/* Footer - Actions */}
      <div className={styles["post-footer"]}>
        <div className={styles["post-stats"]}>
          <span className={liked ? styles["liked-count"] : styles["like-count"]}>
            {likesCount} Likes
          </span>
          <span className={styles["comment-count"]}>{commentCount} Comments</span>
        </div>
        <div className={styles["action-buttons"]}>
          <button
            className={`${styles["action-button"]} ${liked ? styles["liked"] : ""}`}
            onClick={handleLikePost}
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
            Likes
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
          postId={postId}
          currentUserId={currentUserId}
          onCommentAdd={onChangeComment}
        />
      )}

      {/* Share modal */}
      {showShareModal && (
        <SharePostModal
          postId={postId}
          onClose={() => setShowShareModal(false)}
          onShare={handleSharePost}
        />
      )}

      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          initialData={{
            title: title,
            content: content,
            imageUrl: image,
            postId: postId
          }}
          onClose={() => setShowEditModal(false)}
          onUpdateSuccess={(updatedPost) => {
            // Cập nhật UI với dữ liệu mới
            // Bạn có thể cần truyền callback từ component cha
            onEdit?.();
          }}
        />
      )}
    </div>
  );
};

export default PostCard;