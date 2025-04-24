// lib/handleSendLog.ts hoặc utils/handleSendLog.ts

import { ENV_VARS } from "@/lib/envVars";

export interface LogData {
  type: "auth" | "action" | "admin" | "error" | "security" | "system";
  level?: "info" | "warn" | "error" | "debug" | "fatal";
  message: string;
  user?: {
    _id: string;
    email: string;
    role: string;
  };
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export const handleSendLog = async (logData: LogData): Promise<void> => {
  try {
    await fetch(`${ENV_VARS.API_ROUTE}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logData),
      credentials: "include",
    });
  } catch (err) {
    console.error("Gửi log thất bại:", err);
  }
};
