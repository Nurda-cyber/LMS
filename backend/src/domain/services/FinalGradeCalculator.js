const ScaleConverter = require('./ScaleConverter');

/**
 * Доменный сервис расчёта итоговой оценки по курсу.
 *
 * Алгоритм:
 *  1. Группируем задания по категориям (с весами).
 *  2. Для каждой категории считаем средний процент по сданным заданиям.
 *  3. Перемножаем средний процент категории на её вес и суммируем.
 *  4. Если сумма весов всех непустых категорий ≠ 100% — нормализуем.
 *
 * Чистая функция: на вход — данные, на выход — итог; никаких I/O.
 */
class FinalGradeCalculator {
  /**
   * @param {Object} params
   * @param {Array<{id:number, weight:number}>}           params.categories
   * @param {Array<{id:number, categoryId:number|null, maxScore:number}>} params.assignments
   * @param {Array<{assignmentId:number, score:number|null}>} params.grades
   * @returns {{ total:number, letter:string|null, gpa:number|null, categoryBreakdown:Array }}
   */
  static calculate({ categories, assignments, grades }) {
    const byCategory = new Map();
    for (const c of categories) {
      byCategory.set(c.id, {
        id: c.id,
        weight: Number(c.weight) || 0,
        assignments: [],
        averagePercent: 0,
        weighted: 0,
      });
    }

    for (const a of assignments) {
      if (!a.categoryId || !byCategory.has(a.categoryId)) continue;
      const cat = byCategory.get(a.categoryId);
      const grade = grades.find((g) => g.assignmentId === a.id);
      if (!grade || grade.score === null || grade.score === undefined) continue;
      const max = Number(a.maxScore) || 100;
      const score = Number(grade.score);
      if (!Number.isFinite(score) || max <= 0) continue;
      cat.assignments.push({ id: a.id, percent: Math.max(0, Math.min(100, (score / max) * 100)) });
    }

    let totalWeight = 0;
    let total = 0;
    const breakdown = [];

    for (const cat of byCategory.values()) {
      if (cat.assignments.length === 0) {
        breakdown.push({ categoryId: cat.id, average: null, weight: cat.weight, weighted: 0 });
        continue;
      }
      const avg = cat.assignments.reduce((s, a) => s + a.percent, 0) / cat.assignments.length;
      cat.averagePercent = avg;
      cat.weighted = (avg * cat.weight) / 100;
      total += cat.weighted;
      totalWeight += cat.weight;
      breakdown.push({
        categoryId: cat.id,
        average: round(avg, 2),
        weight: cat.weight,
        weighted: round(cat.weighted, 2),
      });
    }

    if (totalWeight > 0 && totalWeight !== 100) {
      total = (total * 100) / totalWeight;
    }

    total = round(Math.max(0, Math.min(100, total)), 2);
    const letter = ScaleConverter.numericToLetter(total);
    const gpa = ScaleConverter.numericToGpa(total);

    return { total, letter, gpa, categoryBreakdown: breakdown };
  }
}

function round(value, digits) {
  const k = 10 ** digits;
  return Math.round(value * k) / k;
}

module.exports = FinalGradeCalculator;
