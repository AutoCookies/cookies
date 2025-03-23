"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/posts/post";
import SharePostCard from "@/components/posts/sharePost";
import ENVVARS from "../../../../utils/config/config";

export default function PostPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${ENVVARS.API_BASE_URL}/posts`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Gửi cookie tự động nếu cần
        });

        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        // console.log("📌 Dữ liệu nhận từ API:", data);
        setPosts(data);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <main className="flex-1 p-6 flex justify-center">
        <div className="w-full max-w-2xl">
          {loading ? (
            <p className="text-gray-500 text-center">Đang tải bài viết...</p>
          ) : (
            <div className="flex flex-col space-y-6">
              {posts.length > 0 ? (
                posts.map((post) =>
                  post.originalPost ? (
                    <SharePostCard key={post._id} post={post} />
                  ) : (
                    <PostCard key={post._id} post={post} />
                  )
                )
              ) : (
                <p className="text-gray-500 text-center">Chưa có bài viết nào.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
