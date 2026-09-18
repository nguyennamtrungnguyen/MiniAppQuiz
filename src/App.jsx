import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import LoginPage from "./pages/admin/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import SubjectsPage from "./pages/admin/SubjectsPage";
import QuestionsPage from "./pages/admin/QuestionsPage";
import ImportPage from "./pages/admin/ImportPage";
import ExportPage from "./pages/admin/ExportPage";

function App() {
  const [allowed, setAllowed] = useState(false);

  // ===== MÀN HÌNH CHẶN (giữ nguyên từ bản gốc) =====
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 text-white px-4">
        <div className="bg-white text-black p-6 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">
            Nguyễn Nam Trung Nguyên có đẹp trai không? 😎
          </h1>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setAllowed(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600"
            >
              Có 👍
            </button>

            <button
              onClick={() => alert("Sai rồi 😏, chọn lại đi!")}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
            >
              Không ❌
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== ROUTING =====
  return (
    <Routes>
      {/* User routes */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/quiz/:subjectId"
        element={
          <Layout>
            <QuizPage />
          </Layout>
        }
      />

      {/* Admin routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="export" element={<ExportPage />} />
      </Route>
    </Routes>
  );
}

export default App;
