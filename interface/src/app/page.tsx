"use client";
import Link from "next/link";
import "../styles/home.css";

export default function Home() {
  return (
    <div className="welcome">
      <div className="title">
        <h1>WELCOME TECH FELLOW, THIS IS MY SOCIAL WEB</h1>
      </div>
      <div className="subtitle">
        <h3>A FRIENDLY SOCIAL WEBSITE, MADE BY GENZ DEVELOPER</h3>
      </div>
      <div className="button-container">
        <button className="btn"><Link href="/auth/signin">GET STARTED</Link></button>
        <button className="btn secondary">LEARN MORE</button>
      </div>
    </div>
  );
}
