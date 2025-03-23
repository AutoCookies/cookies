'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/utils/auth/register';
import Link from 'next/link';

interface FormData {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    },
    []
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const userData = await registerUser(formData);
        console.log('Đăng ký thành công:', userData);

        // Chuyển hướng đến trang Dashboard hoặc Login
        router.push('/auth/login');
      } catch {
        console.log("Error occurred");
      } finally {
        setLoading(false);
      }
    },
    [formData, router]
  );

  const errorMessage = useMemo(
    () => error && <p className="text-red-500 text-center">{error}</p>,
    [error]
  );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-12 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-center mb-4">Đăng Ký</h1>
        {errorMessage}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Tên tài khoản
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
              aria-label="Tên tài khoản"
            />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">
              Họ và Tên
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
              aria-label="Họ và Tên"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
              aria-label="Email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
              aria-label="Mật khẩu"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className="text-center mt-4">
          Already have account?{' '}
          <Link href="/auth/login" className="text-blue-500">
            Signin now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
