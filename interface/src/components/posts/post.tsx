"use client";
import React from "react";
import BasePostCard from "./basePostCard";

const PostCard = ({ post }: { post: any }) => (
  <BasePostCard>
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
      <img src={post.image} alt="Post Image" className="w-full h-auto rounded mb-3" />
    )}
    <p className="text-gray-700 mb-3">{post.content}</p>
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center space-x-2">
        <span className="text-blue-600 font-semibold">{post.likes?.length || 0} Likes</span>
        <span className="text-gray-600">{post.comments?.length || 0} Comments</span>
      </div>
      <button className="text-blue-500 hover:underline">Share</button>
    </div>
  </BasePostCard>
);

export default PostCard;
