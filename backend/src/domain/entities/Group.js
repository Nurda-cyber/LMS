class Group {
  constructor({
    id = null,
    specialtyId,
    name,
    enrollmentYear,
    curatorId = null,
    language = 'ru',
  }) {
    if (!Number.isInteger(specialtyId) || specialtyId <= 0) {
      throw new Error('Group.specialtyId обязателен');
    }
    if (!name || typeof name !== 'string') throw new Error('Group.name обязателен');
    if (!Number.isInteger(enrollmentYear) || enrollmentYear < 2000 || enrollmentYear > 2100) {
      throw new Error('Group.enrollmentYear некорректен');
    }

    this.id = id;
    this.specialtyId = specialtyId;
    this.name = name.trim();
    this.enrollmentYear = enrollmentYear;
    this.curatorId = curatorId ?? null;
    this.language = language || 'ru';
  }
}

module.exports = Group;
