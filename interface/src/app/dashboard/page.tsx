"use client";

import { useEffect, useState } from "react";
import { handleGetUserStatistics } from "@/utils/admin/handleGetUserStatistic";
import styles from "@/styles/dashboard/statistic.module.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserStatistics {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  newUsersThisMonth: number;
  totalAdminUser: number;
  totalUser: number;
  totalMorderatorUser: number;
  totalPublicUser: number;
  totalPrivateUser: number;
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

  // Tính các tỷ lệ
  const verifiedPercentage = ((stats.verifiedUsers / stats.totalUsers) * 100).toFixed(1);
  const bannedPercentage = ((stats.bannedUsers / stats.totalUsers) * 100).toFixed(1);
  const newUsersPercentage = ((stats.newUsersThisMonth / stats.totalUsers) * 100).toFixed(1);
  const privatePercentage = ((stats.totalPrivateUser / stats.totalUsers) * 100).toFixed(1);
  const publicPercentage = ((stats.totalPublicUser / stats.totalUsers) * 100).toFixed(1);

  // Dữ liệu cho biểu đồ phân quyền
  const roleData = {
    labels: ["Admin", "Moderator", "User"],
    datasets: [
      {
        data: [stats.totalAdminUser, stats.totalMorderatorUser, stats.totalUser],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Dữ liệu cho biểu đồ trạng thái tài khoản
  const statusData = {
    labels: ["Verified", "Banned", "New this month"],
    datasets: [
      {
        data: [stats.verifiedUsers, stats.bannedUsers, stats.newUsersThisMonth],
        backgroundColor: ["#4BC0C0", "#FF6384", "#FF9F40"],
        hoverBackgroundColor: ["#4BC0C0", "#FF6384", "#FF9F40"],
      },
    ],
  };

  // Dữ liệu cho biểu đồ chế độ tài khoản
  const privacyData = {
    labels: ["Public", "Private"],
    datasets: [
      {
        data: [stats.totalPublicUser, stats.totalPrivateUser],
        backgroundColor: ["#9966FF", "#C9CBCF"],
        hoverBackgroundColor: ["#9966FF", "#C9CBCF"],
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Thống kê người dùng</h2>

      <div className={styles.statGrid}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Accounts</span>
          <span className={styles.statValue}>{stats.totalUsers}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>New Users In Month</span>
          <span className={styles.statValue}>
            {stats.newUsersThisMonth} <small>({newUsersPercentage}%)</small>
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Verified Accounts</span>
          <span className={styles.statValue}>
            {stats.verifiedUsers} <small>({verifiedPercentage}%)</small>
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Banned Accounts</span>
          <span className={styles.statValue}>
            {stats.bannedUsers} <small>({bannedPercentage}%)</small>
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Admin Accounts</span>
          <span className={styles.statValue}>{stats.totalAdminUser}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>User Accounts</span>
          <span className={styles.statValue}>{stats.totalUser}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Moderator Accounts</span>
          <span className={styles.statValue}>{stats.totalMorderatorUser}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Public Accounts</span>
          <span className={styles.statValue}>
            {stats.totalPublicUser} <small>({publicPercentage}%)</small>
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Private Accounts</span>
          <span className={styles.statValue}>
            {stats.totalPrivateUser} <small>({privatePercentage}%)</small>
          </span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartBox}>
          <h3>Phân bổ quyền người dùng</h3>
          <Pie data={roleData} />
        </div>
        <div className={styles.chartBox}>
          <h3>Trạng thái tài khoản</h3>
          <Pie data={statusData} />
        </div>
        <div className={styles.chartBox}>
          <h3>Chế độ tài khoản</h3>
          <Pie data={privacyData} />
        </div>
      </div>
    </div>
  );
}