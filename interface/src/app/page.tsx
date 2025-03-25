"use client";
import Link from "next/link";
import styles from "../styles/home.module.css"; // Import CSS Modules

export default function Home() {
  return (
    <div className={styles.welcome}>
      <h1 className={styles.title}>WELCOME TECH FELLOW, THIS IS MY SOCIAL WEB</h1>
      <h3 className={styles.subtitle}>A FRIENDLY SOCIAL WEBSITE, MADE BY GENZ DEVELOPER</h3>
      <div className={styles.buttonContainer}>
        <Link href="/auth/signin" className={`${styles.btn} ${styles.primaryBtn}`}>
          GET STARTED
        </Link>
        <Link href="/learn-more" className={`${styles.btn} ${styles.secondaryBtn}`}>
          LEARN MORE
        </Link>
      </div>
    </div>
  );
}
