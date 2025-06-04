// layouts/dashboard/Layout.tsx

"use client";
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
import { handleSignout } from '@/utils/auth/handleSignout';
import styles from '../../styles/dashboard/main.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const onSignOut = async () => {
    try {
      await handleSignout();
      router.push('/auth/signin'); // chuyển về trang đăng nhập
    } catch (err: any) {
      console.error('Lỗi khi đăng xuất:', err.message);
    }
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Header */}
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>
            Statistic
          </Link>
          <Link href="/dashboard/users" className={styles.navLink}>
            Accounts
          </Link>
          <Link href="/dashboard/logs" className={styles.navLink}>
            Logs
          </Link>
          <Link href="/admin/settings" className={styles.navLink}>
            Settings
          </Link>
          {/* Logout button */}
          <button onClick={onSignOut} className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
