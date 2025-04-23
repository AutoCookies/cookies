"use client"

import React, { useEffect, useState } from "react";
import { handleGetAllUser } from "@/utils/admin/handleGetUser";
import { handleDeleteUser } from "@/utils/admin/handleDeleteUser";
import { toast } from "react-hot-toast";
import { handleBanUser } from "@/utils/admin/handleBanUser";  // Đoạn import này thêm để gọi API ban user
import styles from '@/styles/dashboard/users.module.css';
import { handleUnBanUser } from "@/utils/admin/handleUnBanUser";  // Đoạn import này thêm để gọi API unban user

interface User {
    _id: string;
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

    // State to manage ban modal
    const [isBanModalOpen, setIsBanModalOpen] = useState<boolean>(false);
    const [banUser, setBanUser] = useState<User | null>(null);  // Store the user to be banned
    const [reason, setReason] = useState<string>("");
    const [duration, setDuration] = useState<number>(1); // Default to 1 day

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

    const handleBan = async (userId: string) => {
        if (!reason) {
            toast.error("Lý do ban là bắt buộc!");
            return;
        }

        // Chắc chắn rằng currentUserId không phải là null trước khi gọi API
        const success = await handleBanUser(userId, duration, reason); // Truyền reason và duration vào API
        if (success) {
            toast.success(`Đã ban người dùng ${banUser?.username}`);
            setIsBanModalOpen(false);
            fetchUsers();
        }
    };

    const handleUnBan = async (userId: string) => {
        const success = await handleUnBanUser(userId);
        if (success) {
            toast.success(`Đã bỏ ban người dùng ${userId}`);
            fetchUsers();
        }
    }

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
                            <th>Actions</th>
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
                                <td>
                                    {user.isBanned ? (
                                        <button
                                            onClick={async () => {
                                                setBanUser(user);
                                                const confirm = window.confirm(`Bạn có chắc muốn bỏ ban "${user.username}" không?`);
                                                if (!confirm) return;

                                                await handleUnBan(user._id);
                                            }}
                                        >
                                            Unban
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setBanUser(user);
                                                setIsBanModalOpen(true);
                                            }}
                                        >
                                            Ban
                                        </button>
                                    )}

                                    <button
                                        onClick={async () => {
                                            const confirm = window.confirm(`Bạn có chắc muốn xoá tài khoản "${user.username}" không?`);
                                            if (!confirm) return;

                                            const success = await handleDeleteUser(user._id);
                                            if (success) {
                                                fetchUsers();
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
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

            {isBanModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Ban User</h3>
                        <p>Are you sure you want to ban {banUser?.username}?</p>
                        <div>
                            <label>Reason:</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}  // Cập nhật reason khi thay đổi
                            >
                                <option value="">Select a reason</option>
                                <option value="violation_terms">Violated Terms</option>
                                <option value="hate_speech">Hate Speech</option>
                                <option value="spam">Spam</option>
                                <option value="fake_account">Fake Account</option>
                                <option value="violence_content">Violence Content</option>
                                <option value="harassment">Harassment</option>
                                <option value="illegal_activity">Illegal Activity</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label>Duration (days):</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}  // Cập nhật duration khi thay đổi
                            />
                        </div>
                        <div>
                            <button onClick={() => banUser && handleBan(banUser._id)}>Ban</button>
                            <button onClick={() => setIsBanModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
