// src/app/auth/signin/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "@/styles/auth/signin.module.css";
import Link from "next/link";
import { ENV_VARS } from "@/lib/envVars";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1) Chuẩn bị payload:
      let recaptchaToken = "";
      if (showCaptcha && recaptchaRef.current) {
        // Lấy token reCAPTCHA (Invisible)
        recaptchaToken = (await recaptchaRef.current.executeAsync()) || "";
      }

      const body = { email, password } as any;
      if (showCaptcha) {
        body.recaptchaToken = recaptchaToken;
      }

      // 2) Gửi request:
      const res = await fetch(`${ENV_VARS.API_ROUTE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Nếu backend trả needCaptcha: true → bật thẻ captcha
        if (data.needCaptcha) {
          setShowCaptcha(true);
          setError(data.message || "Vui lòng giải reCAPTCHA.");
        } else {
          setError(data.message || "Đăng nhập thất bại.");
        }
        setLoading(false);
        // Reset reCAPTCHA widget để next lần get token mới
        recaptchaRef.current?.reset();
        return;
      }

      // 3) Nếu thành công, có thể server đã set cookie JWT, ta redirect
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Lỗi mạng, vui lòng thử lại.");
      setLoading(false);
      recaptchaRef.current?.reset();
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

        {/* Chỉ render ReCAPTCHA khi cần (sau 3 lần sai) */}
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
