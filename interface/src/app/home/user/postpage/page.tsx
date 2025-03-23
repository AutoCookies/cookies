"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  // Component hiển thị một bài viết bình thường (Post)
  const PostCard = ({ post }: { post: any }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center space-x-3 mb-3">
        <img
          src={post.user?.profilePicture || "/default-avatar.png"}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
        <span className="font-semibold">{post.user?.username}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
      {post.image && (
        <img
          src={post.image} // Đường link Cloudinary trực tiếp
          alt="Post Image"
          className="w-full h-auto rounded mb-3"
        />
      )}
      <p className="text-gray-700 mb-3">{post.content}</p>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 font-semibold">{post.likes?.length || 0} Likes</span>
          <span className="text-gray-600">{post.comments?.length || 0} Comments</span>
        </div>
        <button className="text-blue-500 hover:underline">Share</button>
      </div>
    </div>
  );

  // Component hiển thị bài viết được chia sẻ (SharePost)
  const SharePostCard = ({ post }: { post: any }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Header của share post */}
      <div className="mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={post.user?.profilePicture || "/default-avatar.png"}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
          <span className="font-semibold">{post.user?.username} shared a post</span>
        </div>
        {post.caption && (
          <p className="text-gray-700 mt-2">{post.caption}</p>
        )}
      </div>

      {/* Bài viết gốc */}
      <div className="border p-3 rounded mb-3">
        <div className="flex items-center space-x-2 mb-2">
          <img
            src={post.originalPost.user?.profilePicture || "/default-avatar.png"}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-semibold text-sm">{post.originalPost.user?.username}</span>
        </div>
        <h3 className="text-lg font-bold mb-1">{post.originalPost.title}</h3>
        {post.originalPost.image && (
          <img
            src={post.originalPost.image} // Sử dụng đường link Cloudinary
            alt="Original Post Image"
            className="w-full h-auto rounded mb-1"
          />
        )}
        <p className="text-gray-700 text-sm">{post.originalPost.content}</p>
      </div>

      {/* Footer của share post */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 font-semibold">{post.likes?.length || 0} Likes</span>
          <span className="text-gray-600">{post.comments?.length || 0} Comments</span>
        </div>
        <button className="text-blue-500 hover:underline">Share</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Bài viết</h1>
  
        {loading ? (
          <p className="text-gray-500">Đang tải bài viết...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length > 0 ? (
              posts.map((post) =>
                post.originalPost ? (
                  <SharePostCard key={post._id} post={post} />
                ) : (
                  <PostCard key={post._id} post={post} />
                )
              )
            ) : (
              <p className="text-gray-500">Chưa có bài viết nào.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
