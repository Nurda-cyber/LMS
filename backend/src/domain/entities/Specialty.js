const DEGREES = Object.freeze(['bachelor', 'master', 'phd']);

class Specialty {
  constructor({
    id = null,
    departmentId,
    code,
    name,
    degree = 'bachelor',
    durationYears = 4,
    language = 'ru',
    description = null,
  }) {
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      throw new Error('Specialty.departmentId обязателен');
    }
    if (!code || typeof code !== 'string') throw new Error('Specialty.code обязателен');
    if (!name || typeof name !== 'string') throw new Error('Specialty.name обязателен');
    if (!DEGREES.includes(degree)) throw new Error(`Specialty.degree должен быть одним из ${DEGREES.join(', ')}`);
    if (!Number.isInteger(durationYears) || durationYears < 1 || durationYears > 10) {
      throw new Error('Specialty.durationYears: 1-10');
    }

    this.id = id;
    this.departmentId = departmentId;
    this.code = code.trim();
    this.name = name.trim();
    this.degree = degree;
    this.durationYears = durationYears;
    this.language = language || 'ru';
    this.description = description ? String(description).trim() : null;
  }
}

Specialty.DEGREES = DEGREES;
module.exports = Specialty;
