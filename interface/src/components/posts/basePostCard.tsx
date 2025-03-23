"use client";
import React from "react";

interface BasePostCardProps {
  children: React.ReactNode;
}

const BasePostCard = ({ children }: BasePostCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-xl mx-auto">
      {children}
    </div>
  );
};

export default BasePostCard;
