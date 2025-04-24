'use client';

import { useLogSocket } from '@/hooks/logHooks';
import { useEffect, useState } from 'react';
import { handleGetLogs, LogEntry } from '@/utils/logs/handleGetLogs';
import styles from '@/styles/dashboard/logs.module.css';

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useLogSocket((newLog) => {
    setLogs((prevLogs) => {
      const updatedLogs = [newLog, ...prevLogs];
  
      // Kiểm tra số lượng logs và điều chỉnh lại số trang nếu cần thiết
      if (updatedLogs.length > limit * page) {
        return updatedLogs.slice(0, limit * page);
      }
  
      return updatedLogs;
    });
  
    // Kiểm tra xem số lượng logs có vượt quá số trang hiện tại không, nếu có thì chuyển về trang đầu
    if (logs.length + 1 > limit * page) {
      setPage(1);  // Chuyển về trang đầu tiên nếu số logs vượt quá giới hạn
    }
  });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await handleGetLogs(page, limit);
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Lỗi khi lấy logs:', err);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [page]);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Logs hệ thống</h1>

      {loading ? (
        <p>Đang tải logs...</p>
      ) : logs.length === 0 ? (
        <p>Không có logs nào để hiển thị.</p>
      ) : (
        <div className={styles.logList}>
          {logs.map((log) => (
            <div key={log._id} className={styles.logCard}>
              <div className={styles.logHeader}>
                <span className={styles.logType}>{log.type}</span>
                <span className={styles.logDate}>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <p className={styles.logMessage}>{log.message}</p>
              {log.user && (
                <p className={styles.logUser}>
                  Người dùng: {log.user.email} ({log.user.role})
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          className={styles.pageButton}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Trang trước
        </button>
        <span className={styles.pageText}>
          Trang {page} / {totalPages}
        </span>
        <button
          className={styles.pageButton}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
