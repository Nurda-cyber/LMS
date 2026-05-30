class Department {
  constructor({
    id = null,
    facultyId,
    name,
    shortName = null,
    headOfDepartmentId = null,
    description = null,
  }) {
    if (!Number.isInteger(facultyId) || facultyId <= 0) {
      throw new Error('Department.facultyId обязателен');
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Department.name обязателен');
    }
    this.id = id;
    this.facultyId = facultyId;
    this.name = name.trim();
    this.shortName = shortName ? String(shortName).trim() : null;
    this.headOfDepartmentId = headOfDepartmentId ?? null;
    this.description = description ? String(description).trim() : null;
  }
}

module.exports = Department;
