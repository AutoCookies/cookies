import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies",
  description: "A Social Webapp for everyone, created by a GenZ dev :)))",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-gray-900 text-white py-4">
          <nav className="container mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="logo-container">
              <a href="/">
                <img src="/assets/logo.png" alt="Logo" className="h-10" />
              </a>
            </div>
            {/* Navigation */}
            <ul className="flex space-x-6">
              <li className="hover:underline cursor-pointer">Information</li>
              <li className="hover:underline cursor-pointer">Introduce</li>
              <li className="hover:underline cursor-pointer">About me</li>
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center p-4 mt-8">
          © {new Date().getFullYear()} Cookies | Created by GenZ Dev 🚀
        </footer>
      </body>
    </html>
  );
}
