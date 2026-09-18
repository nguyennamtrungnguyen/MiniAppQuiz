import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition">
            <span className="text-2xl">📚</span>
            <span className="text-lg font-bold">Hệ thống ôn tập</span>
          </Link>
          <Link
            to="/admin/login"
            className="text-white/60 hover:text-white text-sm transition"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/5 border-t border-white/10 py-4 text-center text-white/40 text-sm">
        © 2026 Hệ thống ôn tập — Nguyễn Nam Trung Nguyên
      </footer>
    </div>
  );
}
