// src/app/auth/signin/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
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

  // Khi backend yêu cầu reCAPTCHA
  const [showCaptcha, setShowCaptcha] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let token = "";
      if (showCaptcha && recaptchaRef.current) {
        // Lấy token reCAPTCHA invisible
        token = (await recaptchaRef.current.executeAsync()) || "";
      }

      // Gọi handleSignIn với hoặc không có recaptchaToken
      const data = await handleSignIn(email, password, token);
      console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("ENV_VARS.API_ROUTE:", ENV_VARS.API_ROUTE);

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

      // Điều hướng theo role hoặc trạng thái
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
      // Nếu backend trả needCaptcha = true, err là object { message, needCaptcha }
      if (err.needCaptcha) {
        // Lần sau phải show captcha
        setShowCaptcha(true);
        setError(err.message || "Vui lòng giải reCAPTCHA để tiếp tục.");
      } else {
        // Các lỗi khác (wrong credentials, server error)
        setError(err.message || "Lỗi đăng nhập, thử lại sau.");
      }

      // Nếu đã dùng reCAPTCHA lần này, dù fail hay OK thì cũng phải reset
      recaptchaRef.current?.reset();
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

        {/* Chỉ hiển thị reCAPTCHA khi cần (sau 3 lần thất bại backend báo needCaptcha) */}
        {showCaptcha && (
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            size="invisible"
          />
        )}

        {error && (
          <p className={styles.errorMessage} aria-live="polite">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p>
          Don't have an account? <Link href="/auth/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
