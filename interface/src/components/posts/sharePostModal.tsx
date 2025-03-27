import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./styles/sharePostModal.module.css";

interface SharePostModalProps {
  postId: string;
  onClose: () => void;
  onShare: (caption: string, visibility: "public" | "private" | "friends") => void;
}

const SharePostModal: React.FC<SharePostModalProps> = ({ postId, onClose, onShare }) => {
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");

  const handleSubmit = () => {
    onShare(caption, visibility);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Chia sẻ bài viết</h3>
        <textarea
          className={styles.textarea}
          placeholder="Thêm caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        
        <select
          className={styles.select}
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "public" | "private" | "friends")}
        >
          <option value="public">Công khai</option>
          <option value="private">Chỉ mình tôi</option>
          <option value="friends">Bạn bè</option>
        </select>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>Hủy</button>
          <button className={styles.shareButton} onClick={handleSubmit}>Chia sẻ</button>
        </div>
      </div>
    </div>,
    document.body // Gắn modal vào thẳng `body` để không bị giới hạn trong SharePostCard
  );
};

export default SharePostModal;
