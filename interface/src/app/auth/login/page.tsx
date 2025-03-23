'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/utils/auth/login';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');
      try {
        const userData = await loginUser({ email, password });

        if (!userData || !userData.role) {
          throw new Error("Không xác định được vai trò người dùng.");
        }

        console.log('Đăng nhập thành công', userData);

        // Điều hướng dựa trên vai trò của người dùng
        if (userData.role === 'admin') {
          router.push('/home/admin/dashboard');
        } else {
          router.push('/home/user/postpage');
        }
      } catch (error) {
        setError("Email hoặc mật khẩu không chính xác.");
        console.log("Lỗi đăng nhập:", error);
      }
    },
    [email, password, router]
  );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-12 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-center mb-4">Đăng Nhập</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Đăng nhập
          </button>
        </form>
        <p className="text-center mt-4">
          Chưa có tài khoản?{' '}
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
