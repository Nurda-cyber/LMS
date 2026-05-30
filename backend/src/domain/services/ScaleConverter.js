/**
 * Конвертер между шкалами оценивания.
 *
 *  numeric_100  — 0..100 баллов
 *  ects         — A, B, C, D, F (буквенная по болонской системе)
 *  gpa_4        — 4.0 / 3.7 / 3.3 / ... / 0.0
 *
 * Чистая бизнес-логика без побочных эффектов — легко тестируется.
 */

const SCALES = Object.freeze(['numeric_100', 'ects', 'gpa_4', 'pass_fail']);

const NUMERIC_TO_LETTER = [
  { min: 95, letter: 'A' },
  { min: 90, letter: 'A-' },
  { min: 85, letter: 'B+' },
  { min: 80, letter: 'B' },
  { min: 75, letter: 'B-' },
  { min: 70, letter: 'C+' },
  { min: 65, letter: 'C' },
  { min: 60, letter: 'C-' },
  { min: 55, letter: 'D+' },
  { min: 50, letter: 'D' },
  { min: 0, letter: 'F' },
];

const LETTER_TO_GPA = Object.freeze({
  'A': 4.0,
  'A-': 3.67,
  'B+': 3.33,
  'B': 3.0,
  'B-': 2.67,
  'C+': 2.33,
  'C': 2.0,
  'C-': 1.67,
  'D+': 1.33,
  'D': 1.0,
  'F': 0.0,
});

class ScaleConverter {
  static get SCALES() { return SCALES; }
  static get LETTER_TO_GPA() { return LETTER_TO_GPA; }

  /** Перевод 0..100 → буквенная оценка ECTS. */
  static numericToLetter(score) {
    const s = Number(score);
    if (!Number.isFinite(s)) return null;
    const clamped = Math.max(0, Math.min(100, s));
    return NUMERIC_TO_LETTER.find((row) => clamped >= row.min).letter;
  }

  /** Перевод буквы → GPA 4.0. */
  static letterToGpa(letter) {
    return LETTER_TO_GPA[letter] ?? null;
  }

  /** Прямой перевод numeric 0..100 → GPA 4.0. */
  static numericToGpa(score) {
    const letter = ScaleConverter.numericToLetter(score);
    return letter ? ScaleConverter.letterToGpa(letter) : null;
  }

  /** «Зачтено / не зачтено» по threshold (по умолчанию 50). */
  static numericToPassFail(score, threshold = 50) {
    return Number(score) >= threshold ? 'pass' : 'fail';
  }
}

module.exports = ScaleConverter;
