import { useState, useEffect } from 'react';
import { getSubjects, getQuestions, exportQuestions } from '../../utils/dataManager';

export default function ExportPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0) setSelectedSubject(data[0].id);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      getQuestions(selectedSubject).then(q => setQuestionCount(q.length));
    }
  }, [selectedSubject]);

  const handleExport = () => {
    exportQuestions(selectedSubject);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  if (loading) {
    return <div className="text-gray-500">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📤 Export JSON</h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn môn học</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              📝 Số câu hỏi: <span className="font-semibold">{questionCount}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              File sẽ được tải xuống dưới dạng <code className="bg-gray-200 px-1 rounded">{selectedSubject}.json</code>
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={questionCount === 0}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium disabled:bg-gray-400"
          >
            📥 Tải xuống JSON
          </button>

          {exported && (
            <p className="text-green-600 text-sm text-center">✅ Đã bắt đầu tải xuống!</p>
          )}
        </div>
      </div>
    </div>
  );
}
