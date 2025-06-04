"use client";
import styles from "../../styles/home/home.module.css";
import { ENV_VARS } from "@/lib/envVars";
import React, { useState, useEffect, useRef } from 'react';
import { handleGetNotification, NotificationResponse, Notification } from "@/utils/notifications/handleGetNotification";
import { handleUpdateSeenStatus } from "@/utils/notifications/handleUpdateSeenStatus";
import { useFetchNotifications } from "@/hooks/fetchNotificationHooks";
import { toast } from "react-toastify";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { handleSignout } from "@/utils/auth/handleSignout";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`${ENV_VARS.API_ROUTE}/user/me/profile-picture`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                setProfileImage(data.profilePicture || "/default-profile.jpg");
                setUserId(data.userId);
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

    // Đóng dropdown notifications khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useFetchNotifications(currentUserId ?? "", (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        toast.info(`🔔 ${newNotification.fromUser.username}: ${newNotification.content}`);
    });

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

    const onProfileClick = () => {
        setShowProfileDropdown(prev => !prev);
    };

    const onSignOut = async () => {
        try {
            await handleSignout();
            router.push("/auth/signin"); // hoặc trang bạn muốn chuyển sau khi logout
        } catch (err: any) {
            console.error("Lỗi đăng xuất:", err.message);
        }
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
                    {/* Notification Bell */}
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
                                                    e.preventDefault();
                                                    await handleUpdateSeenStatus({ notificationId: n._id });
                                                    window.location.href = `/home/${n.fromUser._id}`;
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

                    {/* Other Icons */}
                    <button className={styles.iconButton}>
                        <img src="/svg/information-svgrepo-com.svg" alt="Messages" className={styles.iconSVG} />
                    </button>

                    {/* Profile Button & Dropdown */}
                    <div ref={profileRef} style={{ position: 'relative', display: 'inline-block' }}>
                        <button className={styles.iconButton} onClick={onProfileClick}>
                            {profileImage ? (
                                <img src={profileImage} alt="User Profile" className={styles.profileImage} />
                            ) : (
                                <img src="/svg/personal-svgrepo-com.svg" alt="Default Profile" className={styles.iconSVG} />
                            )}
                        </button>

                        {showProfileDropdown && (
                            <div className={styles.profileDropdown}>
                                <ul className={styles.profileMenuList}>
                                    <li className={styles.profileMenuItem}>
                                        <Link href={`/home/${userId}`}>
                                            Trang cá nhân
                                        </Link>
                                    </li>
                                    <li className={styles.profileMenuItem}>
                                        <button onClick={onSignOut} className={styles.signoutButton}>
                                            Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
