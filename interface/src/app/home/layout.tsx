import styles from "../../styles/home/home.module.css"; // Import CSS Modules

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    <h1>Cherry Blossom</h1>
                </div>
                <div className={styles.searchBar}>
                    <input type="text" placeholder="Tìm kiếm..." />
                </div>
                <div className={styles.nav}>
                    <button className={styles.iconButton}>🛎️</button> {/* Example for notification */}
                    <button className={styles.iconButton}>💬</button> {/* Example for messages */}
                    <button className={styles.iconButton}>👤</button> {/* Example for user profile */}
                </div>
            </header>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
