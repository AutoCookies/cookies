// src/app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth/signin.module.css";
import Link from "next/link";
import { handleSignIn } from "@/utils/auth/handleSignin";
import { handleSendLog } from "@/utils/logs/handleSendLog";
import { ENV_VARS } from "@/lib/envVars";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Gọi hàm handleSignIn đã tách riêng
      const data = await handleSignIn(email, password);
      console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("ENV_VARS.API_URL:", ENV_VARS.API_ROUTE);

      // Gửi log đăng nhập thành công
      await handleSendLog({
        type: "auth",
        level: "info",
        message: `Người dùng ${data.email} (${data.role}) đã đăng nhập.`,
        user: { _id: data._id, email: data.email, role: data.role },
        metadata: {
          loginTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });

      // Điều hướng dựa theo role và trạng thái bị cấm
      if (data.isBaned) {
        router.push("/auth/ban");
      } else if (data.role === "admin") {
        router.push("/dashboard");
      } else if (data.role === "moderator") {
        router.push("/moderator");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      // Gửi log lỗi khi đăng nhập thất bại
      await handleSendLog({
        type: "error",
        level: "error",
        message: `Lỗi trong quá trình đăng nhập: ${err.message}`,
        metadata: { email, stack: err.stack },
      });

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signinContainer}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      <h2>Sign In</h2>
      <form onSubmit={onSubmit} className={styles.signinForm}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.inputField}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.inputField}
          disabled={loading}
        />
        {error && (
          <p className={styles.errorMessage} aria-live="polite">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p>
          Don't have an account? <Link href="/auth/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
