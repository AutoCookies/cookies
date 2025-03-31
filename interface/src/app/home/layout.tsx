"use client";
import styles from "../../styles/home/home.module.css";
import { ENV_VARS } from "@/config/envVars";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`${ENV_VARS.API_ROUTE}/user/me/profile-picture`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                setProfileImage(data.profilePicture || "/default-profile.jpg");
            } else {
                console.log("Failed to fetch profile, Status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    useEffect(() => {
        (async () => {
            await fetchUserProfile();
        })();
    }, []);


    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.leftSection}>
                    <div className={styles.logo}>
                        <Link href="/home/postPage" style={{ textDecoration: "none", color: "inherit" }}>
                            <h1>AutoCookies</h1>
                        </Link>
                    </div>
                    <div className={styles.searchBar}>
                        <input type="text" placeholder="Searching..." />
                    </div>
                </div>

                <div className={styles.navIcons}>
                    <Link href="/home/postPage" className={styles.navIcon}>
                        <img src="/svg/front-page-svgrepo-com.svg" className={styles.iconSVG} />
                        <span>Home</span>
                    </Link>
                    <Link href="/explore" className={styles.navIcon}>
                        <img src="/svg/play-svgrepo-com.svg" className={styles.iconSVG} />
                        <span>Explore</span>
                    </Link>
                    <Link href="/create" className={styles.navIcon}>
                        <img src="/svg/user-svgrepo-com.svg" className={styles.iconSVG} />
                        <span>Friend</span>
                    </Link>
                    <Link href="/activity" className={styles.navIcon}>
                        <img src="/svg/play-svgrepo-com.svg" className={styles.iconSVG} />
                        <span>Activity</span>
                    </Link>
                </div>

                <div className={styles.rightSection}>
                    <button className={styles.iconButton}>
                        <img src="/svg/bell-svgrepo-com.svg" alt="Notification" className={styles.iconSVG} />
                    </button>
                    <button className={styles.iconButton}>
                        <img src="/svg/information-svgrepo-com.svg" alt="Messages" className={styles.iconSVG} />
                    </button>
                    <Link href={"/home/me"}>
                        <button className={styles.iconButton}>
                            {profileImage ? (
                                <img src={profileImage} alt="User Profile" className={styles.profileImage} />
                            ) : (
                                <img src="/svg/personal-svgrepo-com.svg" alt="Default Profile" className={styles.iconSVG} />
                            )}
                        </button>
                    </Link>
                </div>
            </header>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}