import { useState, useEffect } from 'react';
import { getSubjects, getQuestions, addQuestion, updateQuestion, deleteQuestion } from '../../utils/dataManager';

export default function QuestionsPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState({
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    answer: 'A',
    explanation: '',
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    async function load() {
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadQuestions();
    }
  }, [selectedSubject]);

  const loadQuestions = async () => {
    const data = await getQuestions(selectedSubject);
    setQuestions(data);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setForm({ question: '', options: { A: '', B: '', C: '', D: '' }, answer: 'A', explanation: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setForm({
      question: q.question,
      options: { ...q.options },
      answer: q.answer,
      explanation: q.explanation || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.question.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    for (const key of ['A', 'B', 'C', 'D']) {
      if (!form.options[key].trim()) {
        alert(`Vui lòng nhập đáp án ${key}`);
        return;
      }
    }

    if (editingQuestion) {
      const updated = updateQuestion(selectedSubject, editingQuestion.id, form);
      setQuestions(updated);
    } else {
      const updated = addQuestion(selectedSubject, {
        question: form.question,
        options: form.options,
        answer: form.answer,
        explanation: form.explanation || undefined,
      });
      setQuestions(updated);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      const updated = deleteQuestion(selectedSubject, id);
      setQuestions(updated);
    }
  };

  const filtered = questions.filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return <div className="text-gray-500">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">❓ Quản lý câu hỏi</h1>
        <button
          onClick={handleOpenAdd}
          disabled={!selectedSubject}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-sm font-medium disabled:bg-gray-400"
        >
          + Thêm câu hỏi
        </button>
      </div>

      {/* Subject selector + search */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
        >
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Tìm kiếm câu hỏi..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">Tổng: {filtered.length} câu hỏi</p>

      {/* Question list */}
      <div className="space-y-3">
        {paged.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Câu {(currentPage - 1) * PAGE_SIZE + idx + 1} (ID: {q.id})</p>
                <p className="font-medium text-gray-800 mb-2">{q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                  {Object.entries(q.options).map(([key, val]) => (
                    <p key={key} className={`${key === q.answer ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                      {key}. {val}
                    </p>
                  ))}
                </div>
                <p className="text-sm text-green-600 mt-1">Đáp án: {q.answer}</p>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => handleOpenEdit(q)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}

        {paged.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
            Không có câu hỏi nào
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm"
          >
            ←
          </button>
          <span className="text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm"
          >
            →
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </div>

              {['A', 'B', 'C', 'D'].map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án {key}</label>
                  <textarea
                    value={form.options[key]}
                    onChange={(e) => setForm({
                      ...form,
                      options: { ...form.options, [key]: e.target.value }
                    })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                    placeholder={`Nhập đáp án ${key}...`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án đúng</label>
                <select
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giải thích (không bắt buộc)</label>
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  placeholder="Nhập giải thích..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
