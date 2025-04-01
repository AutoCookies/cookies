"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/user/UserProfile.module.css";
import { isFollowed } from "@/utils/follow/isFollowed";
import { handleFollowUser } from "@/utils/follow/handleFollowUse";

interface UserProfileHeaderProps {
    data: {
        coverPhoto?: string;
        profilePicture?: string;
        username?: string;
        followerCount?: number;
        followingCount?: number;
    };
    profileUserId: string;
    currentUserId: string;
}

export default function UserProfileHeader({ data, currentUserId, profileUserId }: UserProfileHeaderProps) {
    const isCurrentUser = profileUserId === currentUserId;
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!isCurrentUser) {
            const checkFollowStatus = async () => {
                const followed = await isFollowed(profileUserId);
                setIsFollowing(followed.isFollowing);
            };
            checkFollowStatus();
        }
    }, [profileUserId, isCurrentUser]);

    const handleFollowClick = async () => {
        if (loading || isFollowing === null) return;

        setLoading(true);
        try {
            await handleFollowUser(profileUserId, isFollowing);
            setIsFollowing(!isFollowing); // Đảo trạng thái follow sau khi request thành công
        } catch (error) {
            console.error("Failed to update follow status:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Cover Photo */}
            <div className={styles.coverPhoto}>
                <img
                    src={data.coverPhoto ?? "/default/default-cover.jpg"}
                    alt="Cover Photo"
                    className={styles.coverImage}
                />
            </div>

            {/* Profile Info */}
            <div className={styles.profileSection}>
                {/* Profile Picture */}
                <div className={styles.profilePicture}>
                    <img
                        src={data.profilePicture ?? "/default/default-profile.jpeg"}
                        alt="Profile Picture"
                        className={styles.profileImage}
                    />
                </div>

                {/* Username */}
                <h2 className={styles.username}>{data.username ?? "Unknown User"}</h2>

                {/* Followers and Following */}
                <div className={styles.followInfo}>
                    <span className={styles.followCount}>{data.followerCount ?? 0} người theo dõi</span>
                    <span className={styles.followCount}>{data.followingCount ?? 0} đang theo dõi</span>
                </div>

                {/* Navigation Tabs */}
                <div className={styles.profileTabs}>
                    <span className={styles.tabItem}>Bài viết</span>
                    <span className={styles.tabItem}>Người theo dõi</span>
                    <span className={styles.tabItem}>Hình ảnh</span>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonGroup}>
                    {isCurrentUser ? (
                        <button className={styles.newPostButton}>Đăng tin mới</button>
                    ) : (
                        <>
                            <button className={styles.messageButton}>Nhắn tin</button>
                            {isFollowing !== null && (
                                <button
                                    className={`${styles.followButton} ${isFollowing ? styles.followed : styles.notFollowed
                                        }`}
                                    onClick={handleFollowClick}
                                    disabled={loading}
                                >
                                    {loading ? "Đang xử lý..." : isFollowing ? "Followed" : "Follow"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
