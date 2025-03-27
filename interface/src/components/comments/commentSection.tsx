import React, { useState, useEffect } from "react";
import { getPostComments } from "@/utils/comments/getPostComment";
import { CommentBubble } from "./CommentBubble";
import { handleAddComment } from "@/utils/comments/handleAddComments";
import styles from './styles/commentSection.module.css'; // Sửa import

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  user: {
    id: string;
    username: string;
    profilePicture: string;
  };
  isLiked: boolean;
}

const CommentSection = ({ postId, currentUserId }: { 
  postId: string;
  currentUserId: string;
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await getPostComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      await handleAddComment({
        postId,
        content: newComment
      });
      setNewComment(""); // Xóa nội dung input sau khi gửi
      await fetchComments(); // Làm mới danh sách comment
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className={styles.commentSection}> {/* Áp dụng className từ CSS Module */}
      <div className={styles.commentInputContainer}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className={styles.commentInput} // Dùng styles.commentInput
          disabled={isSubmitting}
        />
        <button
          onClick={handleAddNewComment}
          disabled={!newComment.trim() || isSubmitting}
          className={styles.commentSubmitButton} // Dùng styles.commentSubmitButton
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </div>

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length > 0 ? (
        comments.map((comment) => (
          <CommentBubble
            key={comment.id}
            id={comment.id}
            user={comment.user}
            content={comment.content}
            createdAt={comment.createdAt}
            likeCount={comment.likeCount}
            isLiked={comment.isLiked}
            onLikeChange={fetchComments}
            onDeleteComment={fetchComments}
            onEditComment={fetchComments}
          />
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export default CommentSection;
