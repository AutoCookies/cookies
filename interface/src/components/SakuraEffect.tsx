"use client";
import { useEffect } from "react";
import styles from "@/styles/home.module.css";

export default function SakuraFlower() {
  useEffect(() => {
    const createSakura = () => {
      const sakura = document.createElement("div");
      sakura.classList.add(styles.sakura);

      const left = Math.random() * 100;
      const size = Math.random() * 15 + 5;
      const duration = Math.random() * 10 + 5;

      sakura.style.left = `${left}vw`;
      sakura.style.width = `${size}px`;
      sakura.style.height = `${size}px`;
      sakura.style.animationDuration = `${duration}s`;

      document.querySelector(`.${styles.sakuraContainer}`)?.appendChild(sakura);

      setTimeout(() => {
        sakura.remove();
      }, duration * 1000);
    };

    const sakuraInterval = setInterval(createSakura, 300);

    return () => clearInterval(sakuraInterval);
  }, []);

  return <div className={styles.sakuraContainer}></div>;
}
