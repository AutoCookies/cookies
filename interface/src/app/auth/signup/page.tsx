// src/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/auth/signup.module.css";
import Link from "next/link";
import { handleSignUp } from "@/utils/auth/handleSignup";
import { handleSendLog } from "@/utils/logs/handleSendLog";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
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
      // Gọi hàm handleSignUp đã tách riêng
      const data = await handleSignUp({ username, fullName, email, password });

      // Gửi log đăng ký thành công
      await handleSendLog({
        type: "auth",
        level: "info",
        message: `Người dùng mới đã đăng ký: ${data.email}`,
        user: {
          _id: data._id,
          email: data.email,
          role: data.role,
        },
        metadata: {
          fullName,
          createdAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });

      // Chuyển hướng về trang Sign In
      router.push("/auth/signin");
    } catch (err: any) {
      setError(err.message);
      await handleSendLog({
        type: "error",
        level: "error",
        message: `Lỗi khi đăng ký người dùng ${email}: ${err.message}`,
        metadata: { username, fullName, stack: err.stack },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h2 className={styles.signupTitle}>Sign Up</h2>
      <form onSubmit={onSubmit} className={styles.signupForm}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.inputField}
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className={styles.inputField}
          disabled={loading}
        />
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
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <p className={styles.signupText}>
          Already have an account?{" "}
          <Link href="/auth/signin" className={styles.signupLink}>
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
