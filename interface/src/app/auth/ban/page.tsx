// app/banned/page.tsx
"use client";

import Link from "next/link";

export default function BannedPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ color: "red" }}>Tài khoản của bạn đã bị cấm sử dụng</h1>
      <p>Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là sự nhầm lẫn.</p>
      <Link href="/auth/signin">
        <button style={{ marginTop: "20px", padding: "10px 20px" }}>Quay lại trang đăng nhập</button>
      </Link>
    </div>
  );
}
