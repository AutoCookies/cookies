import React, { useState } from 'react';
import styles from './styles/sharePostCard.module.css';

interface SharePostProps {
  caption: string;
  user: {
    username: string;
    profilePicture: string;
  };
  likesCount: number;
  commentCount: number;
  originalPost: {
    title: string;
    content: string;
    image: string | null;
    user: {
      username: string;
      profilePicture: string;
    };
    likesCount: number;
    commentCount: number;
  };
}

const SharePostCard: React.FC<SharePostProps> = ({
  caption,
  user,
  likesCount,
  commentCount,
  originalPost,
}) => {
  // Tạo state để quản lý likesCount của bài đăng được chia sẻ
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount);

  const handleLike = () => {
    // Tăng số lượng like khi người dùng bấm "like"
    setCurrentLikesCount(prevLikesCount => prevLikesCount + 1);
  };

  return (
    <div className={styles['share-post-card']}>
      {/* Share Header - Displaying the user who shared the post */}
      <div className={styles['share-header']}>
        <div className={styles['share-user-info']}>
          <img
            src={user?.profilePicture || "/default-avatar.jpg"}
            alt="User Avatar"
            className={styles['share-avatar']}
          />
          <span className={styles['share-user']}>
            Chia sẻ bởi <strong>{user?.username || 'Người dùng không xác định'}</strong>
          </span>
        </div>
        <p className={styles['share-caption']}>{caption}</p>
      </div>

      {/* Displaying the original post directly without PostCard */}
      <div className={styles['post-card']}>
        {/* Post Header */}
        <div className={styles['post-card-header']}>
          <img
            src={originalPost.user.profilePicture || "/default-avatar.jpg"}
            alt="User Avatar"
            className={styles['post-avatar']}
          />
          <span className={styles['post-username']}>{originalPost.user.username}</span>
        </div>

        {/* Post Body */}
        <div className={styles['post-card-body']}>
          <h3>{originalPost.title}</h3>
          <p>{originalPost.content}</p>

          {/* Post image */}
          {originalPost.image && (
            <img
              src={originalPost.image}
              alt="Post"
              className={styles['post-image']}
            />
          )}
        </div>

        {/* Post Footer - Likes and comments count */}
        <div className={styles['post-card-footer']}>
          <div className={styles['actions']} onClick={handleLike}>
            <p>{originalPost.likesCount} Likes</p>
            <p>{originalPost.commentCount} Comments</p>
          </div>
        </div>
      </div>

      {/* Footer for share post */}
      <div className={styles['share-footer']}>
        <p>
          <strong>{currentLikesCount}</strong> Likes | <strong>{commentCount}</strong> Comments
        </p>
      </div>
    </div>
  );
};

export default SharePostCard;
