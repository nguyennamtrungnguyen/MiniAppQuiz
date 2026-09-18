import { useState, useEffect } from 'react';
import { getSubjects, importQuestions, getQuestions } from '../../utils/dataManager';
import { validateQuizJSON } from '../../utils/jsonValidator';

export default function ImportPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [importMode, setImportMode] = useState('replace'); // 'replace' or 'append'
  const [imported, setImported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0) setSelectedSubject(data[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsedData(null);
    setValidationResult(null);
    setImported(false);

    // Check if it's a JSON file
    if (!selectedFile.name.endsWith('.json')) {
      setValidationResult({ valid: false, errors: ['File phải có định dạng .json'] });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const result = validateQuizJSON(json);
        setValidationResult(result);
        if (result.valid) {
          setParsedData(json);
        }
      } catch (err) {
        setValidationResult({
          valid: false,
          errors: [`File JSON không hợp lệ: ${err.message}`],
        });
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!parsedData || !selectedSubject) return;

    let dataToImport = parsedData;

    if (importMode === 'append') {
      const existing = await getQuestions(selectedSubject);
      // Re-assign IDs for appended questions to avoid conflicts
      const maxId = existing.reduce((max, q) => Math.max(max, typeof q.id === 'number' ? q.id : 0), 0);
      const newQuestions = parsedData.map((q, idx) => ({
        ...q,
        id: maxId + idx + 1,
      }));
      dataToImport = [...existing, ...newQuestions];
    }

    importQuestions(selectedSubject, dataToImport);
    setImported(true);
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setValidationResult(null);
    setImported(false);
  };

  if (loading) {
    return <div className="text-gray-500">Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📥 Import JSON</h1>

      {imported ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-700 text-lg font-semibold mb-2">✅ Import thành công!</p>
          <p className="text-green-600 mb-4">
            Đã import {parsedData.length} câu hỏi vào môn "{subjects.find(s => s.id === selectedSubject)?.name}"
          </p>
          <button
            onClick={handleReset}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
          >
            Import thêm
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Select subject */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Chọn môn học</h2>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Import mode */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Chế độ Import</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="text-indigo-600"
                />
                <span className="text-sm text-gray-700">Thay thế toàn bộ câu hỏi hiện tại</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="text-indigo-600"
                />
                <span className="text-sm text-gray-700">Thêm vào cuối danh sách hiện tại</span>
              </label>
            </div>
          </div>

          {/* Step 3: Upload file */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Chọn file JSON</h2>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {file && (
              <p className="text-sm text-gray-500 mt-2">📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
            )}
          </div>

          {/* Validation result */}
          {validationResult && !validationResult.valid && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h3 className="text-red-700 font-semibold mb-2">❌ Lỗi Validation</h3>
              <ul className="space-y-1">
                {validationResult.errors.map((err, i) => (
                  <li key={i} className="text-red-600 text-sm">• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {parsedData && validationResult?.valid && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                4. Preview ({parsedData.length} câu hỏi)
              </h2>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {parsedData.slice(0, 20).map((q, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="text-gray-400">Câu {i + 1}</p>
                    <p className="font-medium text-gray-800">{q.question}</p>
                    <p className="text-green-600">Đáp án: {q.answer}</p>
                  </div>
                ))}
                {parsedData.length > 20 && (
                  <p className="text-gray-400 text-center text-sm">... và {parsedData.length - 20} câu hỏi khác</p>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
                >
                  ✓ Xác nhận Import
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
