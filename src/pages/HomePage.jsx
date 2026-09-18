import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSubjects, getQuestions } from '../utils/dataManager';

export default function HomePage() {
  const [subjects, setSubjects] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);

        // Load question counts for each subject
        const counts = {};
        for (const subject of subjectsData) {
          try {
            const questions = await getQuestions(subject.id);
            counts[subject.id] = questions.length;
          } catch {
            counts[subject.id] = 0;
          }
        }
        setQuestionCounts(counts);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">Hệ thống ôn tập</h1>
        <p className="text-white/70 text-lg">Chọn môn học để bắt đầu ôn tập</p>
      </div>

      {/* Subject grid */}
      {subjects.length === 0 ? (
        <div className="text-center text-white/60 py-10">
          <p className="text-xl mb-2">Chưa có môn học nào</p>
          <p>Hãy liên hệ Admin để thêm môn học</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <h2 className="text-xl font-bold text-white">{subject.name}</h2>
              </div>
              <div className="p-5">
                {subject.description && (
                  <p className="text-gray-600 mb-4">{subject.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    📝 {questionCounts[subject.id] || 0} câu hỏi
                  </span>
                  <Link
                    to={`/quiz/${subject.id}`}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition font-medium text-sm"
                  >
                    Bắt đầu ôn tập
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
