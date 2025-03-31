import styles from "../../styles/auth/auth.module.css";
import SakuraFlower from "@/components/ui/SakuraFlower"; // Import SakuraEffect

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authLayout}>
      <SakuraFlower /> {/* 🌸 Hiệu ứng hoa rơi (Client Component) */}

      <main className={styles.authContent}>{children}</main>

      <footer className={styles.authFooter}>
        <p>A social media website made by GenZ dev</p>
        <p>© {new Date().getFullYear()} Cookiescooker. All rights reserved.</p>
      </footer>
    </div>
  );
}
