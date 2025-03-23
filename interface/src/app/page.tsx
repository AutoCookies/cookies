'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import Link from "next/link";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    anime.timeline({ easing: 'easeOutExpo' })
      .add({
        targets: titleRef.current,
        opacity: [0, 1],
        translateY: [-50, 0],
        duration: 1000,
        delay: anime.stagger(100, { start: 300 }) // Hiệu ứng xuất hiện từng chữ
      })
      .add({
        targets: descRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 800
      }, '-=500') // Bắt đầu sớm hơn 500ms
      .add({
        targets: buttonRef.current,
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 700
      }, '-=400'); // Bắt đầu sớm hơn 400ms
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 ref={titleRef} className="text-4xl font-bold opacity-0">Chào mừng đến với AutoCookies</h1>
        <p ref={descRef} className="mt-4 text-gray-600 opacity-0">Nền tảng mạng xã hội dành cho tất cả mọi người!</p>
        <div ref={buttonRef} className="mt-6 space-x-4 opacity-0">
          <Link href="/auth/login" prefetch={true} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-sky-700 transform transition duration-300 hover:scale-110">
            Đăng nhập
          </Link>
          <Link href="/auth/register" prefetch={true} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-sky-700 transform transition duration-300 hover:scale-110">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
