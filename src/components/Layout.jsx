import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    // Random initial number
    const base = Math.floor(Math.random() * 50) + 10;
    setOnlineUsers(base);

    // Random fluctuation every 5-10 seconds
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + change;
        return next > 0 ? next : 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
      <footer className="bg-white/5 border-t border-white/10 py-4 flex flex-col items-center gap-2 text-white/40 text-sm">
        <p>© 2026 Hệ thống ôn tập — Nguyễn Nam Trung Nguyên</p>
        <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-green-400 font-medium">
            Đang truy cập: {onlineUsers}
          </span>
        </div>
      </footer>
    </div>
  );
}
