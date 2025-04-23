"use client";

import React, { useEffect, useState } from "react";
import { handleGetAllUser } from "@/utils/admin/handleGetUser";
import { toast } from "react-hot-toast";
import styles from '@/styles/dashboard/users.module.css';

interface User {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    followerCount: number;
    followingCount: number;
    isBanned: boolean;
    visibility: string;
}

export default function AdminUserPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await handleGetAllUser(page, limit);
        if (data) {
            setUsers(data.users);
            setTotal(data.total);
        } else {
            toast.error("Không thể lấy danh sách người dùng!");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    return (
        <div className={styles.container}>
            {loading ? (
                <p className={styles.loading}>Loading...</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>FullName</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Followers</th>
                            <th>Following</th>
                            <th>Is Banned?</th>
                            <th>Visibility</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, idx) => (
                            <tr key={idx}>
                                <td>{user.username}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.followerCount}</td>
                                <td>{user.followingCount}</td>
                                <td>{user.isBanned ? "Yes" : "No"}</td>
                                <td>{user.visibility}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className={styles.pagination}>
                <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                    Trang trước
                </button>

                <span>
                    Trang {page} / {Math.ceil(total / limit)}
                </span>

                <button
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
}