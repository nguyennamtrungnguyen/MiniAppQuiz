import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubjects, getQuestions } from '../utils/dataManager';

export default function QuizPage() {
  const { subjectId } = useParams();
  const [subjectName, setSubjectName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // Track all answers: { index: { selected, correct } }

  useEffect(() => {
    async function loadData() {
      try {
        const subjects = await getSubjects();
        const subject = subjects.find(s => s.id === subjectId);
        if (subject) {
          setSubjectName(subject.name);
        }

        const data = await getQuestions(subjectId);
        setQuestions(data);
      } catch (err) {
        console.error('Failed to load quiz data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [subjectId]);

  const question = questions[currentIndex];

  const handleSelect = (key) => {
    if (showAnswer) return;

    setSelected(key);
    setShowAnswer(true);

    const isCorrect = key === question.answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Track this answer
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: { selected: key, correct: isCorrect }
    }));
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      // If we've already answered the next question, restore that state
      const nextAnswer = answers[currentIndex + 1];
      if (nextAnswer) {
        setSelected(nextAnswer.selected);
        setShowAnswer(true);
      } else {
        setSelected('');
        setShowAnswer(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      // Restore previous answer state
      const prevAnswer = answers[currentIndex - 1];
      if (prevAnswer) {
        setSelected(prevAnswer.selected);
        setShowAnswer(true);
      } else {
        setSelected('');
        setShowAnswer(false);
      }
    }
  };

  const handleFinish = () => {
    setFinished(true);
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const finalScore = questions.length > 0 ? ((score / questions.length) * 10).toFixed(2) : 0;

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-lg">Đang tải câu hỏi...</div>
      </div>
    );
  }

  // ===== NO QUESTIONS =====
  if (!loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Chưa có câu hỏi</h2>
          <p className="text-gray-600 mb-4">Môn học này chưa có câu hỏi nào.</p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition inline-block"
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // ===== FINISHED =====
  if (finished) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <div className="bg-white text-black p-6 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-2">🎉 Hoàn thành</h1>
          <p className="text-lg text-gray-600 mb-1">{subjectName}</p>
          <p className="mb-2">
            Đúng {score} / {questions.length} câu
          </p>
          <p className="text-3xl font-bold mt-2 text-indigo-600">
            {finalScore} / 10
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              to="/"
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-300 transition"
            >
              ← Trang chủ
            </Link>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelected('');
                setShowAnswer(false);
                setScore(0);
                setFinished(false);
                setAnswers({});
              }}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
            >
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== QUIZ =====
  return (
    <div className="flex items-center justify-center px-3 py-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
        {/* Subject name + back */}
        <div className="flex items-center justify-between mb-3">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            ← Quay lại
          </Link>
          <span className="text-sm text-gray-500 font-medium">{subjectName}</span>
        </div>

        {/* HEADER - Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Câu {currentIndex + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* QUESTION */}
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {question.question}
        </h2>

        {/* OPTIONS */}
        {Object.entries(question.options).map(([key, value]) => {
          let style = 'bg-white';

          if (showAnswer) {
            if (key === question.answer) {
              style = 'bg-green-500 text-white';
            } else if (key === selected) {
              style = 'bg-red-500 text-white';
            }
          } else if (selected === key) {
            style = 'bg-indigo-100';
          }

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`w-full text-left p-3 rounded-xl border mb-2 transition ${style}`}
            >
              <span className="font-semibold">{key}.</span> {value}
            </button>
          );
        })}

        {/* Answer feedback */}
        {showAnswer && (
          <div className="mt-4 text-sm space-y-2">
            {selected === question.answer ? (
              <p className="text-green-600 font-semibold">✅ Chính xác</p>
            ) : (
              <p className="text-red-600 font-semibold">
                ❌ Sai — Đáp án: {question.answer}
              </p>
            )}

            {question.explanation && (
              <div className="bg-gray-100 p-3 rounded-xl">
                <p className="font-semibold text-indigo-600">💡 Giải thích:</p>
                <p className="text-gray-700">{question.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* FOOTER - Navigation */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition"
          >
            ← Câu trước
          </button>

          {currentIndex >= questions.length - 1 ? (
            <button
              onClick={handleFinish}
              disabled={!showAnswer}
              className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              Nộp bài ✓
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!showAnswer}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              Tiếp →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
