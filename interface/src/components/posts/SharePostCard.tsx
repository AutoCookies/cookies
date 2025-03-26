import React, { useState } from "react";
import styles from "./styles/sharePostCard.module.css";
import SharePostModal from "./sharePostModal";
import { handleLike } from "@/utils/posts/handleLike";
import { handleShare } from "@/utils/posts/handleSharePosts";

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
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLikeSharePost = () => {
    handleLike(sharePostId, liked, () => {
      setLiked((prev) => !prev);
      onLike(); // Cập nhật lại danh sách bài viết
    });
  };

  const handleSharePost = () => {
    handleShare(sharePostId, "Bài viết hay quá!", () => {
      console.log("Cập nhật UI sau khi chia sẻ!");
      onShare(); // Cập nhật danh sách bài viết
    });
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
          <button className={styles["icon-button"]}>
            <img src="/svg/information-svgrepo-com.svg" alt="Comment" />
          </button>
          <button className={styles["icon-button"]}>
            <img src="/svg/forward-svgrepo-com.svg" alt="Share" onClick={() => setShowShareModal(true)} />
          </button>
        </div>
      </div>

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
