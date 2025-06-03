import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { LogEntry } from "@/utils/logs/handleGetLogs";
import { ENV_VARS } from "@/lib/envVars";

const SOCKET_URL = ENV_VARS.PUBLIC_SOCLET_URL;

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
