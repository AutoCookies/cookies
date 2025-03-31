'use client';

import React, { useState, useEffect, useCallback, useRef, Children } from "react";
import styles from '@/styles/me/personalPage.module.css';
import { ENV_VARS } from "@/config/envVars";
import { handleGetUserDetails } from "@/utils/me/handleGetUserDetails";
import Link from "next/link";

export default function PersonalPage(
    {
        children,
    }: {
        children: React.ReactNode
    }
) {
    const [coverPhoto, setCoverPhoto] = useState<string>("/default/default-cover.jpg");
    const [profileImage, setProfileImage] = useState<string>("/default/default-cover.jpg");
    const [username, setUsername] = useState<string>("");

    const fetchProfileData = useCallback(async () => {
        try {
            // Fetch cover photo
            const coverRes = await fetch(`${ENV_VARS.API_ROUTE}/user/cover-photo`, { credentials: 'include' });
            if (coverRes.ok) {
                const coverData = await coverRes.json();
                setCoverPhoto(coverData.coverPhoto || "/default/default-cover.jpg");
            }

            // Fetch profile picture
            const profileRes = await fetch(`${ENV_VARS.API_ROUTE}/user/me/profile-picture`, { credentials: 'include' });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfileImage(profileData.profilePicture || "default/default-profile.jpg");
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    }, []);

    const fetchUserDetails = useCallback(async () => {
        try {
            const { data, error } = await handleGetUserDetails();

            if (error) {
                console.error("Error fetching user details:", error);
                return;
            }

            if (data) {
                setUsername(data.username || "");
                console.log("Username set to:", data.username); // Debug log
            }
        } catch (err) {
            console.error("Failed to fetch user details:", err);
        }
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            await fetchUserDetails();
            await fetchProfileData();
        };

        fetchInitialData();
    });

    return (
        <div className={styles.container}>
            {/* Phần Profile Header */}
            <div className={styles.profileHeader}>
                <div className={styles.coverPhotoContainer}>
                    <img
                        src={coverPhoto}
                        alt="Cover"
                        className={styles.coverPhoto}
                        onError={() => setCoverPhoto("/default/default-cover.jpg")}
                    />
                </div>

                <div className={styles.profileInfo}>
                    <div className={styles.avatarContainer}>
                        <img
                            src={profileImage}
                            alt="Profile"
                            className={styles.avatar}
                            onError={() => setProfileImage("/default/default-profile.jpg")}
                        />
                        <h2 className={styles.username}>
                            {username || "Đang tải..."}
                        </h2>
                    </div>
                    <div className={styles.profileNav}>
                        <Link href="/home/me"><button className={styles.navItemActive}>Posts</button></Link>
                        <Link href="/home/me/about"><button className={styles.navItem}>Abouts</button></Link>
                        <Link href="/home/me/friends"><button className={styles.navItem}>Friends</button></Link>
                    </div>
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}