const STORAGE_KEYS = {
  SUBJECTS: 'quiz_subjects',
  QUESTIONS_PREFIX: 'quiz_questions_',
};

// ========== SUBJECTS ==========

export async function getSubjects() {
  // Check localStorage first for overrides
  const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // If localStorage is corrupted, fall through to fetch
    }
  }

  // Load from JSON file
  try {
    const res = await fetch('/data/subjects.json');
    const data = await res.json();
    // Store in localStorage for future admin modifications
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

export function saveSubjects(subjects) {
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

export function addSubject(subject) {
  const subjects = getSubjectsSync();
  subjects.push(subject);
  saveSubjects(subjects);
  return subjects;
}

export function updateSubject(id, updatedSubject) {
  const subjects = getSubjectsSync();
  const index = subjects.findIndex(s => s.id === id);
  if (index !== -1) {
    subjects[index] = { ...subjects[index], ...updatedSubject };
    saveSubjects(subjects);
  }
  return subjects;
}

export function deleteSubject(id) {
  let subjects = getSubjectsSync();
  subjects = subjects.filter(s => s.id !== id);
  saveSubjects(subjects);
  // Also remove questions for this subject
  localStorage.removeItem(STORAGE_KEYS.QUESTIONS_PREFIX + id);
  return subjects;
}

// ========== QUESTIONS ==========

export async function getQuestions(subjectId) {
  // Check localStorage first
  const storageKey = STORAGE_KEYS.QUESTIONS_PREFIX + subjectId;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Fall through
    }
  }

  // Find the subject to get its questionFile
  const subjects = await getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject || !subject.questionFile) {
    return [];
  }

  // Load from JSON file
  try {
    const res = await fetch(subject.questionFile);
    const data = await res.json();
    // Store in localStorage
    localStorage.setItem(storageKey, JSON.stringify(data));
    return data;
  } catch (err) {
    console.error(`Failed to load questions for ${subjectId}:`, err);
    return [];
  }
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

export function saveQuestions(subjectId, questions) {
  const storageKey = STORAGE_KEYS.QUESTIONS_PREFIX + subjectId;
  localStorage.setItem(storageKey, JSON.stringify(questions));
}

export function addQuestion(subjectId, question) {
  const questions = getQuestionsSync(subjectId);
  // Auto-assign ID if not provided
  if (!question.id) {
    const maxId = questions.reduce((max, q) => Math.max(max, typeof q.id === 'number' ? q.id : 0), 0);
    question.id = maxId + 1;
  }
  questions.push(question);
  saveQuestions(subjectId, questions);
  return questions;
}

export function updateQuestion(subjectId, questionId, updatedQuestion) {
  const questions = getQuestionsSync(subjectId);
  const index = questions.findIndex(q => q.id === questionId);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...updatedQuestion };
    saveQuestions(subjectId, questions);
  }
  return questions;
}

export function deleteQuestion(subjectId, questionId) {
  let questions = getQuestionsSync(subjectId);
  questions = questions.filter(q => q.id !== questionId);
  saveQuestions(subjectId, questions);
  return questions;
}

export function importQuestions(subjectId, newQuestions) {
  saveQuestions(subjectId, newQuestions);
  return newQuestions;
}

export function exportQuestions(subjectId) {
  const questions = getQuestionsSync(subjectId);
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
