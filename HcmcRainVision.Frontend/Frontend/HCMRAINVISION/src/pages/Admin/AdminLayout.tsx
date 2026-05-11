/**
 * Admin layout: sidebar nav + outlet for admin pages.
 */
import { NavLink, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, Video, Database, Sparkles, Home } from 'lucide-react';

const navItems = [
  { to: '/admin', end: true, label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/admin/users', end: false, label: 'Người dùng', icon: Users },
  { to: '/admin/audit', end: false, label: 'Báo cáo cần duyệt', icon: ClipboardCheck },
  { to: '/admin/cameras', end: false, label: 'Camera', icon: Video },
  { to: '/admin/ingestion', end: false, label: 'Ingestion', icon: Database },
  { to: '/admin/test-ai', end: false, label: 'Test AI', icon: Sparkles },
] as const;

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-br from-sky-500/10 to-blue-600/10 p-4">
          <h1 className="text-lg font-semibold text-gray-900">HCMC Rain · Admin</h1>
          <Link
            to="/"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-sky-700 transition-all duration-200 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Home className="h-4 w-4 shrink-0" aria-hidden />
            Về trang chủ
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.99] ${
                  isActive
                    ? 'border-l-2 border-sky-600 bg-sky-50 text-sky-900'
                    : 'border-l-2 border-transparent text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
