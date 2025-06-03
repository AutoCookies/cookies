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
  needCaptcha?: boolean;
}

export async function handleSignIn(
  email: string,
  password: string,
  recaptchaToken?: string
): Promise<LoginResponse> {
  const url = `${ENV_VARS.API_ROUTE}/auth/login`;
  console.log(">>> [handleSignIn] POST to:", url);

  // Tạo body JSON; nếu có recaptchaToken thì thêm vào
  const payload: any = { email, password };
  if (recaptchaToken) {
    payload.recaptchaToken = recaptchaToken;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // để nhận cookie JWT từ backend
    body: JSON.stringify(payload),
  });

  const data: LoginResponse | LoginError = await res.json();

  if (!res.ok) {
    // Nếu backend gửi về needCaptcha = true
    const err = data as LoginError;
    if (err.needCaptcha) {
      // “throw” một object để SignIn component có thể kiểm tra err.needCaptcha
      throw { message: err.message, needCaptcha: true };
    }
    // Trường hợp bình thường (401, 429, 500, …)
    throw new Error(err.message || "Đăng nhập thất bại");
  }

  return data as LoginResponse;
}
