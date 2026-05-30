const TERMS = Object.freeze(['fall', 'spring', 'summer']);

class Semester {
  constructor({
    id = null,
    academicYearId,
    term,
    startDate = null,
    endDate = null,
    isActive = false,
  }) {
    if (!Number.isInteger(academicYearId) || academicYearId <= 0) {
      throw new Error('Semester.academicYearId обязателен');
    }
    if (!TERMS.includes(term)) throw new Error(`Semester.term: ${TERMS.join(', ')}`);
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('Semester.startDate не может быть позже endDate');
    }

    this.id = id;
    this.academicYearId = academicYearId;
    this.term = term;
    this.startDate = startDate;
    this.endDate = endDate;
    this.isActive = !!isActive;
  }
}

Semester.TERMS = TERMS;
module.exports = Semester;
