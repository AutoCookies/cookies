import Link from 'next/link';
import React from 'react';
import styles from '../../styles/dashboard/main.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layoutContainer}>
            {/* Header */}
            <header className={styles.header}>
                <h1>Admin Dashboard</h1>
                <nav className={styles.nav}>
                    <Link href="/dashboard" className={styles.navLink}>
                        Thống kê
                    </Link>
                    <Link href="/dashboard/users" className={styles.navLink}>
                        Tài khoản
                    </Link>
                    <Link href="/admin/posts" className={styles.navLink}>
                        Bài viết
                    </Link>
                    <Link href="/admin/settings" className={styles.navLink}>
                        Cài đặt
                    </Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
