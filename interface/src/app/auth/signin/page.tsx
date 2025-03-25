"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/auth/signin.module.css";
import Link from "next/link";
import { ENV_VARS } from "../../../config/envVars";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${ENV_VARS.API_ROUTE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại!");
      }

      console.log("User data:", data);

      if (data.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/home/postPage");
      }
    } catch (err: any) {
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
      <form onSubmit={handleSignIn} className={styles.signinForm}>
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
