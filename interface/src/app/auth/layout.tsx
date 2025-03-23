import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cookies",
  description: "A Social Webapp for everyone, created by a GenZ dev :)))",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
      {/* Header */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto text-center text-xl font-bold">
          Cookies - Social Webapp
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url("/assets/background.png")` }}>
          {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6">
        <p className="text-gray-700 font-medium">Chào mừng bạn đến với Cookies!</p>
        <p className="text-gray-500 text-sm mt-1">
          Được tạo bởi một lập trình viên GenZ - Kết nối mọi người dễ dàng hơn.
        </p>
        <div className="mt-3 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Cookies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
