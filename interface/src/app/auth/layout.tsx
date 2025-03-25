import styles from "../../styles/auth/auth.module.css"; // Import CSS Modules

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authLayout}>
      {/* 🌸 Thêm hiệu ứng hoa rơi */}
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

      <main className={styles.authContent}>{children}</main>

      <footer className={styles.authFooter}>
        <p>A social media website made by GenZ dev</p>
        <p>© {new Date().getFullYear()} Cookiescooker. All rights reserved.</p>
      </footer>
    </div>
  );
}
