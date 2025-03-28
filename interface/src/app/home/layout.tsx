"use client";
import styles from "../../styles/home/home.module.css";
import { ENV_VARS } from "@/config/envVars";
import React, { useState, useEffect } from 'react';

export default function HomeLayout({ children }: { children: React.ReactNode }) {

    // State để lưu ảnh profile
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const fetchUserProfile = async () => {
        // const token = localStorage.getItem("token");

        // if (!token) {
        //     console.error("Token không tồn tại trong localStorage!");
        //     return;
        // }

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
                console.log("User Profile:", data);

                // Cập nhật profile image nếu có
                setProfileImage(data.profilePicture || "/default-profile.jpg");
            } else {
                console.error("Không thể lấy thông tin profile, Status:", response.status);
            }
        } catch (error) {
            console.error("Có lỗi khi fetch dữ liệu:", error);
        }
    };

    // Gọi hàm fetchUserProfile khi component mount
    useEffect(() => {
        fetchUserProfile();
    }, []);

    return (
        <div>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    <a href="/home/postPage" style={{ textDecoration: "none", color: "inherit" }}><h1>AutoCookies</h1></a>
                </div>
                <div className={styles.searchBar}>
                    <input type="text" placeholder="Searching..." />
                </div>
                <div className={styles.nav}>
                    {/* Thay thế icon notification bằng file SVG */}
                    <button className={styles.iconButton}>
                        <img src="/svg/bell-svgrepo-com.svg" alt="Notification" className={styles.iconSVG} />
                    </button>
                    {/* Thay thế icon messages bằng file SVG */}
                    <button className={styles.iconButton}>
                        <img src="/svg/information-svgrepo-com.svg" alt="Messages" className={styles.iconSVG} />
                    </button>
                    
                    {/* Hiển thị ảnh profile nếu có, nếu không thì hiển thị icon SVG */}
                    <button className={styles.iconButton} onClick={fetchUserProfile}>
                        {profileImage ? (
                            <img src={profileImage} alt="User Profile" className={styles.profileImage} />
                        ) : (
                            <img src="/svg/personal-svgrepo-com.svg" alt="Default Profile" className={styles.iconSVG} />
                        )}
                    </button> 
                </div>
            </header>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
