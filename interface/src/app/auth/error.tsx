"use client";

import styles from '@/styles/auth/error.module.css';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Lỗi xảy ra:", error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.sakura}></div>
      <div className={styles.content}>
        <Image
          src="/assets/error.gif"
          alt="Error Animation"
          width={400}
          height={400}
          className={styles.image}
        />
        <div className={styles.textOverlay}>
          <h2 className={styles.heading}>Đã xảy ra lỗi!</h2>
          <p className={styles.message}>{error.message}</p>
          <button
            onClick={() => reset()}
            className={styles.retryButton}
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}