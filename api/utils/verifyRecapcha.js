// src/utils/recaptcha.js
import fetch from "node-fetch";
import { ENV_VARS } from "../config/envVars";

const RECAPTCHA_SECRET = ENV_VARS.RECAPTCHA_SECRET_KEY; // Không để prefix NEXT_PUBLIC_

export async function verifyRecaptchaToken(token, remoteIp) {
  if (!token) return { success: false, error: "No token provided" };

  const params = new URLSearchParams();
  params.append("secret", RECAPTCHA_SECRET);
  params.append("response", token);
  if (remoteIp) {
    params.append("remoteip", remoteIp);
  }

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await res.json();
  return data; // data.success (boolean), data["error-codes"], data.score (v3),…
}
