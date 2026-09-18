import { useState, useEffect } from 'react';
import { getSubjects, getQuestions } from '../../utils/dataManager';

export default function DashboardPage() {
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ totalQuestions: 0, maxSubject: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);

        let totalQuestions = 0;
        let maxCount = 0;
        let maxSubject = null;

        for (const subject of subjectsData) {
          const questions = await getQuestions(subject.id);
          const count = questions.length;
          totalQuestions += count;
          if (count > maxCount) {
            maxCount = count;
            maxSubject = { ...subject, count };
          }
        }

        setStats({ totalQuestions, maxSubject });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Đang tải thống kê...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Tổng số môn học</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{subjects.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Tổng số câu hỏi</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalQuestions}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Môn nhiều câu hỏi nhất</p>
          <p className="text-lg font-bold text-purple-600 mt-1">
            {stats.maxSubject ? `${stats.maxSubject.name} (${stats.maxSubject.count})` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Subject list */}
      <div className="bg-white rounded-xl shadow">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Các môn hiện có</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {subjects.map((subject) => (
            <div key={subject.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{subject.name}</p>
                <p className="text-sm text-gray-500">{subject.description}</p>
              </div>
              <span className="text-sm text-gray-400">ID: {subject.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
