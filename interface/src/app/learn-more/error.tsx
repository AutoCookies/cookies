"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Authentication Error:", error);
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-box">
        <h1>⚠️ Oops! Có lỗi xảy ra</h1>
        <p>Chúng tôi không thể xử lý yêu cầu của bạn ngay bây giờ.</p>
        <p>Vui lòng thử lại sau hoặc quay lại trang chủ.</p>
        <button onClick={reset}>Thử lại</button>
      </div>
      <style jsx>{`
        .error-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(to bottom, #ffdde1, #ee9ca7); /* Hồng pastel */
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .error-box {
          background: rgba(255, 255, 255, 0.9);
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.8s ease-in-out;
        }

        h1 {
          color: #d6336c;
          font-size: 24px;
          font-family: "Brush Script MT", cursive;
        }

        p {
          font-size: 16px;
          color: #444;
          margin: 5px 0;
        }

        button {
          background: #ff69b4;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          transition: 0.3s ease;
        }

        button:hover {
          background: #ff85c1;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hiệu ứng hoa anh đào rơi */
        .error-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          width: 100%;
          height: 100%;
          background: url("/sakura-petals.png") repeat;
          opacity: 0.5;
          animation: fall 10s linear infinite;
        }

        @keyframes fall {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 200px 600px;
          }
        }
      `}</style>
    </div>
  );
}
