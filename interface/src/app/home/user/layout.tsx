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
      <body className="antialiased flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-sky-400 to-blue-500 text-white py-4 shadow-lg">
          <nav className="container mx-auto flex justify-between items-center px-6">
            {/* Logo */}
            <div className="logo-container">
              <a href="/">
                <img src="/assets/logo.png" alt="Logo" className="h-10 drop-shadow-md" />
              </a>
            </div>
            {/* Navigation */}
            <ul className="flex space-x-6 text-white font-medium">
              <li className="hover:text-blue-200 transition duration-300 cursor-pointer">Information</li>
              <li className="hover:text-blue-200 transition duration-300 cursor-pointer">Introduce</li>
              <li className="hover:text-blue-200 transition duration-300 cursor-pointer">About me</li>
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
