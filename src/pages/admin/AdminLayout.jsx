import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { path: '/admin/subjects', label: 'Quản lý môn học', icon: '📚' },
  { path: '/admin/questions', label: 'Quản lý câu hỏi', icon: '❓' },
  { path: '/admin/import', label: 'Import JSON', icon: '📥' },
  { path: '/admin/export', label: 'Export JSON', icon: '📤' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold">🔧 Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Xin chào, {user?.username}</p>
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition mb-2"
          >
            <span>🏠</span>
            <span>Về trang chủ</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition w-full"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
