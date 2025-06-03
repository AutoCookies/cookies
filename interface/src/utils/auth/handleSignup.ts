// src/utils/auth/handleSignUp.ts

import { ENV_VARS } from "@/lib/envVars";

interface SignUpRequest {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

interface SignUpSuccess {
  _id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

export async function handleSignUp({
  username,
  fullName,
  email,
  password,
}: SignUpRequest): Promise<SignUpSuccess> {
  const url = `${ENV_VARS.API_ROUTE}/auth/signup`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, fullName, email, password }),
    credentials: "include",
  });

  const payload = await res.json();

  // Nếu status không phải 201 (Created), backend sẽ trả status 200 với { message }
  if (res.status !== 201) {
    const msg = payload.message || "Đăng ký thất bại!";
    throw new Error(msg);
  }

  // Trường hợp 201: payload chính là data { _id, username, email, role, token }
  return payload as SignUpSuccess;
}
