import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  FileText,
  LogOut,
  User,
  BookOpen,
} from 'lucide-react';
import React from 'react';

const menuItems = [
  { path: '/teacher', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { path: '/teacher/projects', label: 'โครงการ', icon: FolderKanban },
  { path: '/teacher/feedback', label: 'ข้อเสนอแนะ', icon: MessageSquare },
  { path: '/teacher/reports', label: 'รายงาน', icon: FileText },
];

export function DashboardLayout_teacher() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const userName = currentUser?.name || 'ดร.สมหญิง มีชัย';

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl text-green-700 font-bold">ติดตามโครงการ</h2>
          <p className="text-xs text-gray-600 mt-1">ระบบมหาวิทยาลัย</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium">อาจารย์</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/teacher'
                ? location.pathname === '/teacher' || location.pathname === '/teacher/'
                : location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-end gap-4">
            <span className="text-sm font-medium text-gray-800">{userName}</span>
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
