import { useState, useEffect } from 'react';
import { getSubjects, addSubject, updateSubject, deleteSubject, getQuestions } from '../../utils/dataManager';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({ id: '', name: '', description: '', questionFile: '' });
  const [loading, setLoading] = useState(true);

  const loadSubjects = async () => {
    const data = await getSubjects();
    setSubjects(data);

    const counts = {};
    for (const s of data) {
      try {
        const q = await getQuestions(s.id);
        counts[s.id] = q.length;
      } catch {
        counts[s.id] = 0;
      }
    }
    setQuestionCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setForm({ id: '', name: '', description: '', questionFile: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (subject) => {
    setEditingSubject(subject);
    setForm({ ...subject });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.id.trim() || !form.name.trim()) {
      alert('Vui lòng nhập ID và tên môn học');
      return;
    }

    if (editingSubject) {
      const updated = updateSubject(editingSubject.id, form);
      setSubjects(updated);
    } else {
      // Check duplicate ID
      if (subjects.some(s => s.id === form.id)) {
        alert('ID môn học đã tồn tại');
        return;
      }
      const updated = addSubject({ ...form, questionFile: form.questionFile || `/data/subjects/${form.id}.json` });
      setSubjects(updated);
    }

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa môn học này? Tất cả câu hỏi sẽ bị xóa.')) {
      const updated = deleteSubject(id);
      setSubjects(updated);
    }
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-gray-500">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📚 Quản lý môn học</h1>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
        >
          + Thêm môn học
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm môn học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Tên môn</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Mô tả</th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-600">Số câu hỏi</th>
              <th className="px-5 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((subject) => (
              <tr key={subject.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-600 font-mono">{subject.id}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{subject.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{subject.description || '—'}</td>
                <td className="px-5 py-3 text-sm text-center text-gray-600">{questionCounts[subject.id] || 0}</td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => handleOpenEdit(subject)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-gray-400">
                  Không tìm thấy môn học nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingSubject ? 'Sửa môn học' : 'Thêm môn học mới'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID (slug)</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  disabled={!!editingSubject}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                  placeholder="VD: tu-tuong-hcm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: Tư tưởng Hồ Chí Minh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="VD: Ôn tập môn Tư tưởng Hồ Chí Minh"
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
                {editingSubject ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
