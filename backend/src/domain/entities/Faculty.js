/**
 * Доменная сущность «Факультет». Plain JS — не зависит от ORM.
 * Содержит инварианты, проверяемые в конструкторе.
 */
class Faculty {
  constructor({ id = null, name, shortName = null, description = null }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Faculty.name обязателен');
    }
    this.id = id;
    this.name = name.trim();
    this.shortName = shortName ? String(shortName).trim() : null;
    this.description = description ? String(description).trim() : null;
  }
}

module.exports = Faculty;
