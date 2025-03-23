'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { loginUser } from '@/utils/login';

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
        console.log('Đăng nhập thành công', userData);
        router.push('../home/dashboard');
      } catch {
        console.log("Error occurred");
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
            Signin
          </button>
        </form>
        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Signup now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
