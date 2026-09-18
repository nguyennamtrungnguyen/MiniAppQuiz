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
