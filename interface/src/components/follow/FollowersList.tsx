// components/followers/FollowersList.tsx
"use client";

import { useEffect, useState } from "react";
import { handleGetFollowes } from "@/utils/follow/handleGetFollowes";
import Image from "next/image";
import styles from "@/styles/follow/FollowersList.module.css"; // Đường dẫn đúng đến file CSS module


type Follower = {
    _id: string;
    username: string;
    profilePicture: string;
};

interface FollowersListProps {
    userId: string;
}

export default function FollowersList({ userId }: FollowersListProps) {
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFollowers = async () => {
            if (!userId) return;

            try {
                const data = await handleGetFollowes(userId);
                setFollowers(data.followers || []);
            } catch (err) {
                setError("Không thể lấy danh sách follower.");
            } finally {
                setLoading(false);
            }
        };

        fetchFollowers();
    }, [userId]);

    if (loading) return <div className="p-4">Đang tải danh sách người theo dõi...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Người theo dõi</h1>
            {followers.length === 0 ? (
                <p className={styles.empty}>Chưa có ai theo dõi.</p>
            ) : (
                <ul className={styles.list}>
                    {followers.map((follower) => (
                        <li key={follower._id} className={styles.item}>
                            <Image
                                src={follower.profilePicture || "/default-avatar.png"}
                                alt={follower.username}
                                width={50}
                                height={50}
                                className={styles.avatar}
                            />
                            <span className={styles.username}>{follower.username}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
