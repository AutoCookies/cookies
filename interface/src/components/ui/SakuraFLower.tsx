"use client";

import styles from "../../styles/auth/auth.module.css"; // Import CSS Modules

export default function SakuraFlower() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div 
          key={i} 
          className={styles.sakuraPetal} 
          style={{ 
            left: `${Math.random() * 100}%`, 
            animationDuration: `${Math.random() * 5 + 5}s` 
          }} 
        />
      ))}
    </>
  );
}
