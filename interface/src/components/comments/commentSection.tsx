import React, { useState, useEffect } from "react";
import { getPostComments } from "@/utils/comments/getPostComment";
import {CommentBubble} from "./commentBubble"; // Đảm bảo tên đúng

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  user: {
    id: string;
    username: string;
    profilePicture: string;
  };
}

const CommentSection = ({ postId }: { postId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
        const fetchedComments = await getPostComments(postId);
        console.log("Fetched comments:", fetchedComments); // Log dữ liệu để kiểm tra
        setComments(fetchedComments);
    } catch (error) {
        console.error("Failed to fetch comments", error);
    } finally {
        setLoading(false);
    }
};

  // Hàm callback để fetch lại bình luận khi like
  const handleLikeChange = () => {
    console.log("Like changed, refetching comments...");
    fetchComments(); // Fetch lại bình luận sau khi like
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const fetchedComments = await getPostComments(postId);
        
        // Debug log to verify the data
        console.log('Fetched and normalized comments:', fetchedComments);
        
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  return (
    <div>
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length > 0 ? (
        comments.map((comment) => {
          console.log(`Comment section ${comment.id} isLiked:`, comment.isLiked);
          return (
            <CommentBubble
              key={comment.id} // Đảm bảo rằng mỗi component có key duy nhất
              id={comment.id}
              user={comment.user}
              content={comment.content}
              createdAt={comment.createdAt}
              likeCount={comment.likeCount}
              isLiked={comment.isLiked}
              onLikeChange={handleLikeChange} // Truyền callback vào CommentBubble
            />
          );
        })
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export default CommentSection;
