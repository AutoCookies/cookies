import React, { useState } from "react";
import styles from "./styles/postCard.module.css";
import { handleLike } from "@/utils/posts/handleLike";
import { handleShare } from "@/utils/posts/handleSharePosts";
import CommentSection from "../comments/commentSection";
import SharePostModal from "@/components/posts/sharePostModal";

interface PostProps {
  postId: string;
  title: string;
  content: string;
  image: string | null;
  likesCount: number;
  commentCount: number;
  isLiked: boolean;
  user: {
    username: string;
    profilePicture: string;
  };
  onLike: () => void;
  onShare: () => void;
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
  onShare
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false); // State mới để điều khiển hiển thị CommentSection

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
    setShowComments((prev) => !prev); // Toggle hiển thị CommentSection
  };

  return (
    <div className={styles["post-card"]}>
      {/* Header - User info */}
      <div className={styles["post-card-header"]}>
        <img
          src={user.profilePicture || "/default-avatar.jpg"}
          alt="User Avatar"
          className={styles["user-avatar"]}
        />
        <span className={styles.username}>{user.username}</span>
      </div>

      {/* Body - Post content */}
      <div className={styles["post-card-body"]}>
        <h3>{title}</h3>
        <p>{content}</p>

        {/* Hiển thị ảnh nếu có */}
        {image && <img src={image} alt="Post" className={styles["post-image"]} />}
      </div>

      {/* Footer - Actions */}
      <div className={styles["post-card-footer"]}>
        <div className={styles.actions}>
          <p style={{ color: liked ? "#ff4081" : "#333" }}>
            <strong>{likesCount}</strong> Likes
          </p>
          <p>
            <strong>{commentCount}</strong> Comments
          </p>
        </div>
        <div className={styles.buttons}>
          <button className={styles["icon-button"]} onClick={handleLikePost}>
            <img
              src="/svg/like-svgrepo-com.svg"
              alt="Like"
              className={liked ? styles.liked : ""}
            />
          </button>
          <button className={styles["icon-button"]} onClick={toggleComments}>
            <img src="/svg/information-svgrepo-com.svg" alt="Comment" />
          </button>
          <button className={styles["icon-button"]} onClick={() => setShowShareModal(true)}>
            <img src="/svg/forward-svgrepo-com.svg" alt="Share" />
          </button>
        </div>
      </div>

      {/* Hiển thị CommentSection khi nút Comment được nhấn */}
      {showComments && <CommentSection postId={postId} />}

      {/* Hiển thị modal khi nhấn Share */}
      {showShareModal && (
        <SharePostModal
          postId={postId}
          onClose={() => setShowShareModal(false)}
          onShare={handleSharePost}
        />
      )}
    </div>
  );
};

export default PostCard;
