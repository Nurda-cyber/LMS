/**
 * Расчёт GPA (Grade Point Average) по списку итоговых оценок.
 *
 * Формула: Σ(gpa_i × credits_i) / Σ(credits_i)
 * Если credits=0/null — задание игнорируется (без веса нет смысла).
 */
class GpaCalculator {
  /**
   * @param {Array<{ gpa: number|null, credits: number|null }>} grades
   * @returns {number|null} GPA с двумя знаками после запятой, либо null если нечего считать
   */
  static calculate(grades) {
    let weighted = 0;
    let totalCredits = 0;
    for (const g of grades) {
      if (g.gpa === null || g.gpa === undefined) continue;
      const credits = Number(g.credits) || 0;
      if (credits <= 0) continue;
      weighted += Number(g.gpa) * credits;
      totalCredits += credits;
    }
    if (totalCredits === 0) return null;
    return Math.round((weighted / totalCredits) * 100) / 100;
  }
}

module.exports = GpaCalculator;
