"use client";

import { useEffect, useState } from "react";
import { handleGetUserStatistics } from "@/utils/admin/handleGetUserStatistic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "@/styles/dashboard/statistic.module.css";

interface UserStatistics {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  newUsersThisMonth: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStatistics | null>(null);

  useEffect(() => {
    (async () => {
      const result = await handleGetUserStatistics();
      setStats(result);
    })();
  }, []);

  if (!stats) {
    return <div>Đang tải thống kê người dùng...</div>;
  }

  const chartData = [
    { name: "Đã xác minh", value: stats.verifiedUsers },
    { name: "Bị cấm", value: stats.bannedUsers },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Thống kê người dùng</h2>

      <div className={styles.summary}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Tổng người dùng:</span>
          <span className={styles.statValue}>{stats.totalUsers}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Người dùng mới trong tháng:</span>
          <span className={styles.statValue}>{stats.newUsersThisMonth}</span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#82ca9d" name="Số lượng" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
