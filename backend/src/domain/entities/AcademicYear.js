class AcademicYear {
  constructor({ id = null, startYear, endYear, isActive = false }) {
    if (!Number.isInteger(startYear) || startYear < 2000 || startYear > 2100) {
      throw new Error('AcademicYear.startYear некорректен');
    }
    if (!Number.isInteger(endYear) || endYear !== startYear + 1) {
      throw new Error('AcademicYear.endYear должен быть startYear + 1');
    }
    this.id = id;
    this.startYear = startYear;
    this.endYear = endYear;
    this.isActive = !!isActive;
  }

  get label() {
    return `${this.startYear}/${this.endYear}`;
  }
}

module.exports = AcademicYear;
