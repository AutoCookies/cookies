import { ENV_VARS } from "@/lib/envVars";

interface UserLog {
    _id: string;
    email: string;
    role: string;
}

export interface LogEntry {
    _id: string;
    type: "auth" | "action" | "admin" | "error" | "security" | "system";
    level?: "info" | "warn" | "error" | "debug" | "fatal";
    message: string;
    user?: UserLog;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface GetLogsResponse {
    success: boolean;
    logs: LogEntry[];
    total: number;
    page: number;
    totalPages: number;
}

export const handleGetLogs = async (page = 1, limit = 10): Promise<GetLogsResponse> => {
    const res = await fetch(`${ENV_VARS.API_ROUTE}/logs?page=${page}&limit=${limit}`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Không thể lấy log từ server");
    }

    const data = await res.json();
    return data;
};
