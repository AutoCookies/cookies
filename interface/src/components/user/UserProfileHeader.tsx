import styles from "@/styles/user/UserProfile.module.css";

interface UserProfileHeaderProps {
    data: {
        coverPhoto?: string;
        profilePicture?: string;
        username?: string;
    };
    profileUserId: string;
    currentUserId: string;
}

export default function UserProfileHeader({ data, currentUserId, profileUserId }: UserProfileHeaderProps) {
    const isCurrentUser = profileUserId === currentUserId;

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
                        <button className={styles.messageButton}>Nhắn tin</button>
                    )}
                </div>
            </div>
        </div>
    );
}
