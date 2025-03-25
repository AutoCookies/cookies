import React, { useState } from 'react';
import styles from './styles/postCard.module.css';

interface PostProps {
  title: string;
  content: string;
  image: string | null;
  likesCount: number;
  commentCount: number;
  user: {
    username: string;
    profilePicture: string;
  };
}

const PostCard: React.FC<PostProps> = ({ title, content, image, likesCount, commentCount, user }) => {
  // Tạo state để theo dõi likesCount
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount);

  // Hàm xử lý khi người dùng bấm "Like"
  const handleLike = () => {
    setCurrentLikesCount(prevLikes => prevLikes + 1); // Tăng lượt thích lên 1
  };

  return (
    <div className={styles['post-card']}>
      {/* Header - User info */}
      <div className={styles['post-card-header']}>
        <img src={user.profilePicture || "/default-avatar.jpg"} alt="User Avatar" className={styles['user-avatar']} />
        <span className={styles.username}>{user.username}</span>
      </div>

      {/* Body - Post content */}
      <div className={styles['post-card-body']}>
        <h3>{title}</h3>
        <p>{content}</p>

        {/* Hiển thị ảnh nếu có */}
        {image && (
          <img
            src={image}
            alt="Post"
            className={styles['post-image']}
          />
        )}
      </div>

      {/* Footer - Actions */}
      <div className={styles['post-card-footer']}>
        <div className={styles.actions}>
          {/* Thêm sự kiện onClick vào phần likes */}
          <p onClick={handleLike} style={{ cursor: 'pointer' }}>
            {currentLikesCount} Likes
          </p>
          <p>{commentCount} Comments</p>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
