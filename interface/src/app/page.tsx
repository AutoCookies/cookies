"use client";
import Link from "next/link";
import { useEffect } from "react";
import styles from "../styles/home.module.css";

export default function Home() {
  useEffect(() => {
    // Hiệu ứng cánh hoa rơi
    const createSakura = () => {
      const sakura = document.createElement('div');
      sakura.classList.add(styles.sakura);
      
      // Random vị trí và kích thước
      const left = Math.random() * 100;
      const size = Math.random() * 15 + 5;
      const duration = Math.random() * 10 + 5;
      
      sakura.style.left = `${left}vw`;
      sakura.style.width = `${size}px`;
      sakura.style.height = `${size}px`;
      sakura.style.animationDuration = `${duration}s`;
      
      document.querySelector(`.${styles.sakuraContainer}`)?.appendChild(sakura);
      
      // Tự động xóa sau khi rơi xong
      setTimeout(() => {
        sakura.remove();
      }, duration * 1000);
    };
    
    // Tạo cánh hoa liên tục
    const sakuraInterval = setInterval(createSakura, 300);
    
    return () => clearInterval(sakuraInterval);
  }, []);

  return (
    <div className={styles.container}>
      {/* Background hoa anh đào */}
      <div className={styles.sakuraContainer}></div>
      
      <div className={styles.welcome}>
        <h1 className={styles.title}>
          WELCOME TO AUTOCOOKIES SOCIAL
        </h1>
        
        <h3 className={styles.subtitle}>
          <span className={styles.animatedText}>
            A gentle social space, blooming like cherry blossoms. Made by GenZ Developer
          </span>
        </h3>
        
        <div className={styles.buttonContainer}>
          <Link 
            href="/auth/signin" 
            className={`${styles.btn} ${styles.primaryBtn}`}
          >
            GET STARTED
            <span className={styles.btnHoverEffect}></span>
          </Link>
          
          <Link 
            href="/learn-more" 
            className={`${styles.btn} ${styles.secondaryBtn}`}
          >
            LEARN MORE
            <span className={styles.btnHoverEffect}></span>
          </Link>
        </div>
      </div>
    </div>
  );
}