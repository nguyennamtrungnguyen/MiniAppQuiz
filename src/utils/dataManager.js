import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEYS = {
  SUBJECTS: 'quiz_subjects',
  QUESTIONS_PREFIX: 'quiz_questions_',
};

// ========== SUBJECTS ==========

export async function getSubjects() {
  // 1. Nếu có Firebase, ưu tiên đồng bộ từ Firestore
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'subjects'));
      if (!snap.empty) {
        const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
        return subjects;
      }

      // Nếu Firestore trống (lần đầu tạo), tự động nạp dữ liệu mặc định từ subjects.json lên Firestore
      const res = await fetch('/data/subjects.json');
      const defaultSubjects = await res.json();
      for (const sub of defaultSubjects) {
        await setDoc(doc(db, 'subjects', sub.id), sub);
        // Nạp luôn câu hỏi của môn này nếu có
        if (sub.questionFile) {
          try {
            const qRes = await fetch(sub.questionFile);
            const qData = await qRes.json();
            await setDoc(doc(db, 'quiz_data', sub.id), { questions: qData });
            localStorage.setItem(STORAGE_KEYS.QUESTIONS_PREFIX + sub.id, JSON.stringify(qData));
          } catch (e) {
            console.warn(`Không thể nạp trước câu hỏi cho ${sub.id}:`, e);
          }
        }
      }
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(defaultSubjects));
      return defaultSubjects;
    } catch (err) {
      console.error('Lỗi khi tải môn học từ Firebase:', err);
    }
  }

  // 2. Fallback nếu chưa kết nối Firebase: Dùng localStorage
  const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Bỏ qua lỗi parse
    }
  }

  // 3. Fallback đọc từ file tĩnh JSON
  try {
    const res = await fetch('/data/subjects.json');
    const data = await res.json();
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('Failed to load subjects:', err);
    return [];
  }
}

export function getSubjectsSync() {
  const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveSubjects(subjects) {
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

export async function addSubject(subject) {
  const subjects = await getSubjects();
  subjects.push(subject);
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'subjects', subject.id), subject);
      // Tạo sẵn document câu hỏi rỗng trên Firestore
      await setDoc(doc(db, 'quiz_data', subject.id), { questions: [] });
    } catch (err) {
      console.error('Lỗi khi thêm môn học lên Firebase:', err);
    }
  }
  return subjects;
}

export async function updateSubject(id, updatedSubject) {
  const subjects = await getSubjects();
  const index = subjects.findIndex(s => s.id === id);
  if (index !== -1) {
    subjects[index] = { ...subjects[index], ...updatedSubject };
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'subjects', id), updatedSubject, { merge: true });
    } catch (err) {
      console.error('Lỗi khi cập nhật môn học trên Firebase:', err);
    }
  }
  return subjects;
}

export async function deleteSubject(id) {
  let subjects = await getSubjects();
  subjects = subjects.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  localStorage.removeItem(STORAGE_KEYS.QUESTIONS_PREFIX + id);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'subjects', id));
      await deleteDoc(doc(db, 'quiz_data', id));
    } catch (err) {
      console.error('Lỗi khi xóa môn học trên Firebase:', err);
    }
  }
  return subjects;
}

// ========== QUESTIONS ==========

export async function getQuestions(subjectId) {
  // 1. Nếu có Firebase, ưu tiên đọc từ Firestore
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'quiz_data', subjectId));
      if (snap.exists()) {
        const data = snap.data();
        const questions = data.questions || [];
        localStorage.setItem(STORAGE_KEYS.QUESTIONS_PREFIX + subjectId, JSON.stringify(questions));
        return questions;
      }
    } catch (err) {
      console.error(`Lỗi khi tải câu hỏi cho ${subjectId} từ Firebase:`, err);
    }
  }

  // 2. Kiểm tra localStorage
  const storageKey = STORAGE_KEYS.QUESTIONS_PREFIX + subjectId;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Fall through
    }
  }

  // 3. Fallback đọc file tĩnh json
  const subjects = await getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  const questionFile = subject?.questionFile || `/data/subjects/${subjectId}.json`;

  try {
    const res = await fetch(questionFile);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(storageKey, JSON.stringify(data));

      // Tự động sao lưu lên Firestore nếu Firestore chưa có
      if (isFirebaseConfigured && db) {
        setDoc(doc(db, 'quiz_data', subjectId), { questions: data }).catch(console.error);
      }
      return data;
    }
  } catch (err) {
    console.warn(`Chưa có file câu hỏi tĩnh cho ${subjectId}`);
  }

  return [];
}

export function getQuestionsSync(subjectId) {
  const storageKey = STORAGE_KEYS.QUESTIONS_PREFIX + subjectId;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export async function saveQuestions(subjectId, questions) {
  const storageKey = STORAGE_KEYS.QUESTIONS_PREFIX + subjectId;
  localStorage.setItem(storageKey, JSON.stringify(questions));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'quiz_data', subjectId), { questions });
    } catch (err) {
      console.error(`Lỗi khi lưu câu hỏi lên Firebase:`, err);
    }
  }
}

export async function addQuestion(subjectId, question) {
  const questions = await getQuestions(subjectId);
  if (!question.id) {
    const maxId = questions.reduce((max, q) => Math.max(max, typeof q.id === 'number' ? q.id : 0), 0);
    question.id = maxId + 1;
  }
  questions.push(question);
  await saveQuestions(subjectId, questions);
  return questions;
}

export async function updateQuestion(subjectId, questionId, updatedQuestion) {
  const questions = await getQuestions(subjectId);
  const index = questions.findIndex(q => q.id === questionId);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...updatedQuestion };
    await saveQuestions(subjectId, questions);
  }
  return questions;
}

export async function deleteQuestion(subjectId, questionId) {
  let questions = await getQuestions(subjectId);
  questions = questions.filter(q => q.id !== questionId);
  await saveQuestions(subjectId, questions);
  return questions;
}

export async function importQuestions(subjectId, newQuestions) {
  await saveQuestions(subjectId, newQuestions);
  return newQuestions;
}

export async function exportQuestions(subjectId) {
  const questions = await getQuestions(subjectId);
  const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${subjectId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ========== STATS ==========

export async function getQuestionCount(subjectId) {
  const questions = await getQuestions(subjectId);
  return questions.length;
}
