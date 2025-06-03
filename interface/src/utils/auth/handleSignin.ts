// src/utils/auth/handleSignIn.ts
import { ENV_VARS } from "@/lib/envVars";

interface LoginResponse {
  _id: string;
  username: string;
  fullname: string;
  email: string;
  role: string;
  isBaned: boolean;
  token: string;
}

interface LoginError {
  message: string;
}

export async function handleSignIn(email: string, password: string): Promise<LoginResponse> {
  const url = `${ENV_VARS.API_ROUTE}/auth/login`;
  console.log(">>> [envVars.ts] RAW NEXT_PUBLIC_API_ROUTE =", process.env.PUBLIC_NEXT_API_ROUTE);
  console.log(">>> [handleSignIn] ENV_VARS.API_ROUTE =", ENV_VARS.API_ROUTE);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", // để nhận cookie
  });

  const data: LoginResponse | LoginError = await res.json();

  if (!res.ok) {
    const msg = (data as LoginError).message || "Đăng nhập thất bại";
    throw new Error(msg);
  }

  return data as LoginResponse;
}
