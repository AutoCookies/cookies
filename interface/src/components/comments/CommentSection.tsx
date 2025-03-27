import React, { useEffect, useState, useRef } from "react";
import CommentBubble from "./CommentBubble";
import styles from "./styles/commentSection.module.css";
import { getPostComments } from "@/utils/posts/getPostComment";

interface Comment {
  user: {
    username: string;
    profilePicture: string;
  };
  content: string;
  likeCount: number;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  onClose: () => void;  // Nhận function để đóng CommentSection
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);  // Thêm useRef để theo dõi div

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getPostComments(postId);
        console.log("Dữ liệu từ API:", response);

        if (response?.data?.comments && Array.isArray(response.data.comments)) {
          setComments(response.data.comments);
        } else {
          console.error("Lỗi: Không tìm thấy danh sách comments trong response");
          setComments([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy comment:", error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // Đóng khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        onClose();  // Gọi hàm đóng khi click ra ngoài
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={sectionRef} className={styles.commentSection}>
      <h3>Comments</h3>
      {loading ? <p>Loading...</p> : comments.length === 0 ? <p>Have no comments</p> : (
        comments.map((comment, index) => (
          <CommentBubble key={index} {...comment} />
        ))
      )}
    </div>
  );
};

export default CommentSection;
