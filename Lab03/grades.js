// ============================================================
// Завдання 2 — Калькулятор успішності
// ============================================================
// Реалізуйте 5 функцій. Перевірте у Console (відкрийте grades.html).
// ============================================================

const grades = [78, 92, 45, 88, 67, 39, 95, 71, 82, 58, 90, 64];


/**
 * Повертає середній бал, округлений до 1 знаку після коми.
 * average([5, 10, 15]) // 10.0
 */
function average(grades) {   
  if (grades.length === 0) {
    return 0;
  }

  let sum = 0;

  for (const grade of grades) {
    sum += grade;
  }

  return Number((sum / grades.length).toFixed(1));
}


 /**
 * Повертає найвищу оцінку.
 * Обмеження: НЕ використовувати Math.max(...grades) напряму.
 */
 
function highest(grades) {
  if (grades.length === 0) {
    return null;
  }

  let highestGrade = grades[0];

  for (const grade of grades) {
    if (grade > highestGrade) {
      highestGrade = grade;
    }
  }

  return highestGrade;
}

/**
 * Повертає найнижчу оцінку.
 * Обмеження: НЕ використовувати Math.min(...grades) напряму.
 */
function lowest(grades) {
  if (grades.length === 0) {
    return null;
  }

  let lowestGrade = grades[0];

  for (const grade of grades) {
    if (grade < lowestGrade) {
      lowestGrade = grade;
    }
  }

  return lowestGrade;
}

/**
 * Повертає відсоток оцінок >= threshold.
 * passRate([60, 50, 70], 60) // 66.7
 */

function passRate(grades, threshold = 60) {
  if (grades.length === 0) {
    return 0;
  }

  let passedCount = 0;

  for (const grade of grades) {
    if (grade >= threshold) {
      passedCount++;
    }
  }

  return Number(((passedCount / grades.length) * 100).toFixed(1));
}

/**
 * Повертає об'єкт з кількістю оцінок у діапазонах:
 * { "<60": 2, "60-69": 2, "70-79": 2, "80-89": 3, "90-100": 3 }
 */

function distribution(grades) {
  const result = {
    "<60": 0,
    "60-69": 0,
    "70-79": 0,
    "80-89": 0,
    "90-100": 0
  };

  for (const grade of grades) {
    if (grade < 60) {
      result["<60"]++;
    } else if (grade <= 69) {
      result["60-69"]++;
    } else if (grade <= 79) {
      result["70-79"]++;
    } else if (grade <= 89) {
      result["80-89"]++;
    } else {
      result["90-100"]++;
    }
  }

  return result;
}

// ============================================================
// Тестування — розкоментуйте після реалізації
// ============================================================

console.log("Середнє:    ", average(grades));
console.log("Найвища:    ", highest(grades));
console.log("Найнижча:   ", lowest(grades));
console.log("Pass rate:  ", passRate(grades), "%");
console.log("Distribution:", distribution(grades));