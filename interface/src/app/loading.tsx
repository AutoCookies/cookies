"use client";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Đang tải...</p>
      <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(to bottom, #ffdde1, #ee9ca7); /* Hồng pastel */
            position: relative;
            overflow: hidden;
          }
          
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.5);
            border-top-color: #ff69b4; /* Màu hồng sakura */
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          p {
            font-size: 18px;
            color: #fff;
            margin-top: 10px;
            font-family: "Brush Script MT", cursive;
            text-shadow: 1px 1px 4px rgba(255, 255, 255, 0.8);
          }

          /* Hiệu ứng hoa anh đào rơi */
          .loading-container::before {
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
