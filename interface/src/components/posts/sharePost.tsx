"use client";
import React from "react";
import BasePostCard from "./basePostCard";

const SharePostCard = ({ post }: { post: any }) => (
  <BasePostCard>
    <div className="mb-3">
      <div className="flex items-center space-x-3">
        <img
          src={post.user?.profilePicture || "/default-avatar.png"}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
        <span className="font-semibold">{post.user?.username} shared a post</span>
      </div>
      {post.caption && <p className="text-gray-700 mt-2">{post.caption}</p>}
    </div>

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
        <img src={post.originalPost.image} alt="Original Post Image" className="w-full h-auto rounded mb-1" />
      )}
      <p className="text-gray-700 text-sm">{post.originalPost.content}</p>
    </div>

    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center space-x-2">
        <span className="text-blue-600 font-semibold">{post.likes?.length || 0} Likes</span>
        <span className="text-gray-600">{post.comments?.length || 0} Comments</span>
      </div>
      <button className="text-blue-500 hover:underline">Share</button>
    </div>
  </BasePostCard>
);

export default SharePostCard;
