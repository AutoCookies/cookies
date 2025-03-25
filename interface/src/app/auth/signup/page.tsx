"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/auth/signup.module.css";
import Link from "next/link";
import { ENV_VARS } from "../../../config/envVars";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${ENV_VARS.API_ROUTE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fullName, email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Đăng ký thất bại!");
      }

      const data = await res.json();
      console.log("Registered user:", data);

      router.push("/auth/signin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>

      <h2 className={styles.signupTitle}>Sign Up</h2>
      <form onSubmit={handleSignUp} className={styles.signupForm}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className={styles.inputField}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.inputField}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.inputField}
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
