import SakuraEffect from "@/components/SakuraEffect";
import Link from "next/link";
import styles from "@/styles/home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Background hoa anh đào */}
      <SakuraEffect />

      <div className={styles.welcome}>
        <h1 className={styles.title}>WELCOME TO AUTOCOOKIES SOCIAL</h1>

        <h3 className={styles.subtitle}>
          <span className={styles.animatedText}>
            A gentle social space, blooming like cherry blossoms. Made by GenZ Developer
          </span>
        </h3>

        <div className={styles.buttonContainer}>
          <Link href="/auth/signin" className={`${styles.btn} ${styles.primaryBtn}`}>
            GET STARTED
            <span className={styles.btnHoverEffect}></span>
          </Link>

          <Link href="/learn-more" className={`${styles.btn} ${styles.secondaryBtn}`}>
            LEARN MORE
            <span className={styles.btnHoverEffect}></span>
          </Link>
        </div>
      </div>
    </div>
  );
}
