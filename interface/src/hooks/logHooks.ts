import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { LogEntry } from "@/utils/logs/handleGetLogs";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socket: Socket | null = null;

export function useLogSocket(onNewLog: (log: LogEntry) => void) {
  useEffect(() => {
    if (!socket) {
      socket = io(SOCKET_URL, { withCredentials: true });
    }

    socket.on("new-log", (log: LogEntry) => {
      onNewLog(log);
    });

    return () => {
      socket?.off("new-log");
    };
  }, [onNewLog]);
}
