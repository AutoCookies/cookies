import React, { useState } from "react";
import styles from "./styles/sharePostCard.module.css";
import SharePostModal from "./sharePostModal";
import { handleLike } from "@/utils/posts/handleLike";
import { handleShare } from "@/utils/posts/handleSharePosts";
import CommentSection from "../comments/commentSection"; // Thêm import CommentSection

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
  onShare: () => void;
  currentUserId: string; // Thêm currentUserId
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
  currentUserId,
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false); // Thêm state cho comment section

  const handleLikeSharePost = () => {
    handleLike(sharePostId, liked, () => {
      setLiked((prev) => !prev);
      onLike();
    });
  };

  const handleSharePost = (caption: string, visibility: "public" | "private" | "friends") => {
    handleShare(sharePostId, caption, visibility, () => {
      console.log("Cập nhật UI sau khi chia sẻ!", visibility);
      onShare();
    });
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev); // Toggle hiển thị comment section
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
          <button className={styles["icon-button"]} onClick={handleLikeSharePost}>
            <img
              src="/svg/like-svgrepo-com.svg"
              alt="Like"
              className={liked ? styles.liked : ""}
            />
          </button>
          <button 
            className={styles["icon-button"]} 
            onClick={toggleComments}
            aria-label={showComments ? "Hide comments" : "Show comments"}
          >
            <img src="/svg/information-svgrepo-com.svg" alt="Comment" />
          </button>
          <button 
            className={styles["icon-button"]}
            onClick={() => setShowShareModal(true)}
          >
            <img src="/svg/forward-svgrepo-com.svg" alt="Share" />
          </button>
        </div>
      </div>

      {/* Hiển thị comment section khi nhấn nút comment */}
      {showComments && (
        <CommentSection 
          postId={sharePostId} 
        />
      )}

      {/* Hiển thị modal khi nhấn Share */}
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