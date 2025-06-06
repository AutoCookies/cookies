// src/utils/auth/handleRefreshToken.ts

import { ENV_VARS } from "@/lib/envVars";

export async function handleRefreshToken(): Promise<boolean> {
    try {
        const url = `${ENV_VARS.API_ROUTE}/auth/refresh-token`;
        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
        });
        const data = await res.json();
        console.debug("[handleRefreshToken] Response:", res.status, data);

        if (!res.ok) return false;
        return true;
    } catch (err) {
        console.error("[handleRefreshToken] Exception:", err);
        return false;
    }
}

