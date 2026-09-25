/**
 * Validates an array of quiz questions from imported JSON.
 * Returns { valid: boolean, errors: string[], data: array }
 */
export function validateQuizJSON(data) {
  const errors = [];

  // Check if data is an array
  if (!Array.isArray(data)) {
    return {
      valid: false,
      errors: ["Dữ liệu phải là một mảng (Array)"],
      data: [],
    };
  }

  if (data.length === 0) {
    return {
      valid: false,
      errors: ["Mảng dữ liệu rỗng, không có câu hỏi nào"],
      data: [],
    };
  }

  const seenIds = new Set();
  const validAnswers = ["A", "B", "C", "D"];

  data.forEach((item, index) => {
    const pos = index + 1;

    // Check if item is an object
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      errors.push(`Câu hỏi số ${pos}: phải là một object`);
      return;
    }

    // Check id
    if (item.id === undefined || item.id === null) {
      errors.push(`Câu hỏi số ${pos}: thiếu trường 'id'`);
    } else if (seenIds.has(item.id)) {
      errors.push(`Câu hỏi số ${pos}: id '${item.id}' bị trùng lặp`);
    } else {
      seenIds.add(item.id);
    }

    // Check question
    if (
      !item.question ||
      typeof item.question !== "string" ||
      item.question.trim() === ""
    ) {
      errors.push(`Câu hỏi số ${pos}: thiếu hoặc rỗng trường 'question'`);
    }

    // Check options
    if (!item.options || typeof item.options !== "object") {
      errors.push(`Câu hỏi số ${pos}: thiếu trường 'options'`);
    } else {
      validAnswers.forEach((key) => {
        if (
          !item.options[key] ||
          typeof item.options[key] !== "string" ||
          item.options[key].trim() === ""
        ) {
          errors.push(`Câu hỏi số ${pos}: thiếu hoặc rỗng đáp án ${key}`);
        }
      });
    }

    // Check answer
    if (!item.answer) {
      errors.push(`Câu hỏi số ${pos}: thiếu trường 'answer'`);
    } else if (!validAnswers.includes(item.answer)) {
      errors.push(
        `Câu hỏi số ${pos}: 'answer' phải là A, B, C hoặc D (hiện tại: '${item.answer}')`,
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : [],
  };
}
