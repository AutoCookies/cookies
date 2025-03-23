export default function Dashboard() {
    return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white p-5 hidden md:block">
          <h2 className="text-xl font-bold mb-4">Dashboard</h2>
          <ul className="space-y-3">
            <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">🏠 Home</li>
            <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">📊 Analytics</li>
            <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">⚙️ Settings</li>
          </ul>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 bg-gray-100 p-6">
          <h1 className="text-2xl font-semibold">Welcome to Dashboard 🎉</h1>
          <p className="text-gray-600 mt-2">Here is an overview of your app's performance.</p>
  
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Users</h3>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Revenue</h3>
              <p className="text-2xl font-bold text-green-600">$12,345</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <p className="text-2xl font-bold text-red-600">56</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  