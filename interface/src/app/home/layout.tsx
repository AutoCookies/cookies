"use client";
import styles from "../../styles/home/home.module.css";
import { ENV_VARS } from "@/lib/envVars";
import React, { useState, useEffect, useRef } from 'react';
import { handleGetNotification, NotificationResponse, Notification } from "@/utils/notifications/handleGetNotification";
import Link from 'next/link';
import { handleUpdateSeenStatus } from "@/utils/notifications/handleUpdateSeenStatus";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
                setUserId(data.userId);
            } else {
                console.log("Failed to fetch profile, Status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch(`${ENV_VARS.API_ROUTE}/auth/me`, {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setCurrentUserId(data._id.toString());
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchCurrentUser();
    }, []);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = async () => {
        if (!currentUserId) {
            console.warn("User chưa đăng nhập");
            return;
        }
        if (!showDropdown) {
            const { data, error } = await handleGetNotification();
            if (!error && data) {
                setNotifications(data.notifications);
            }
        }
        setShowDropdown(prev => !prev);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.leftSection}>
                    <div className={styles.logo}>
                        <Link href="/home" style={{ textDecoration: "none", color: "inherit" }}>
                            <h1>AutoCookies</h1>
                        </Link>
                    </div>
                    <div className={styles.searchBar}>
                        <input type="text" placeholder="Searching..." />
                    </div>
                </div>

                <div className={styles.navIcons}>
                    <Link href="/home" className={styles.navIcon}>
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
                    <button
                        className={styles.iconButton}
                        onClick={handleBellClick}
                        style={{ position: 'relative' }}
                    >
                        <img src="/svg/bell-svgrepo-com.svg" alt="Notification" className={styles.iconSVG} />
                        {notifications.some(n => !n.seen) && (
                            <span className={styles.unreadCount}>
                                {notifications.filter(n => !n.seen).length}
                            </span>
                        )}
                    </button>

                    {showDropdown && (
                        <div ref={dropdownRef} className={styles.notificationDropdown}>
                            <h4 className={styles.dropdownTitle}>Thông báo</h4>
                            {notifications.length === 0 ? (
                                <p className={styles.noNotification}>Không có thông báo nào.</p>
                            ) : (
                                <ul className={styles.notificationList}>
                                    {notifications.map(n => (
                                        <li key={n._id} className={styles.notificationItem}>
                                            <a
                                                href={`/home/${n.fromUser._id}`}
                                                className={styles.notificationLink}
                                                onClick={async (e) => {
                                                    e.preventDefault(); // Ngăn điều hướng ngay lập tức
                                                    await handleUpdateSeenStatus({ notificationId: n._id });
                                                    window.location.href = `/home/${n.fromUser._id}`; // Điều hướng thủ công qua HTML
                                                }}
                                            >
                                                <strong>{n.fromUser.username}</strong> {n.content}
                                                <span className={styles.time}>
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <button className={styles.iconButton}>
                        <img src="/svg/information-svgrepo-com.svg" alt="Messages" className={styles.iconSVG} />
                    </button>
                    <Link href={`/home/${userId}`}>
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
