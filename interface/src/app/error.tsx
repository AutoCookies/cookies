"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Lỗi xảy ra:", error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      {/* Container chứa GIF và chữ */}
      <div className="relative">
        {/* Ảnh GIF */}
        <Image
          src="/assets/error.gif"
          alt="Error Animation"
          width={400}
          height={400}
          className="rounded-lg opacity-80"
        />

        {/* Text nằm trên GIF */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h2 className="text-2xl font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
            Đã xảy ra lỗi!
          </h2>
          <p className="mt-2 text-center bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
            {error.message}
          </p>
          <button
            onClick={() => reset()}
            className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700 transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}
