import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useFetchNotifications(
  userId: string,
  onNewNotifications: (notification: any) => void
) {
  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, { withCredentials: true });

    socket.emit("join-room", userId); // Tham gia phòng riêng

    socket.on("new-notification", onNewNotifications);

    return () => {
      socket.emit("leave-room", userId);
      socket.disconnect();
    };
  }, [userId, onNewNotifications]);
}
