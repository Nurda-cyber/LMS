const { NotFoundError } = require('../../../shared/errors/AppError');

/**
 * Универсальная Sequelize-реализация StructureRepository.
 * Параметризуется конкретной моделью и доменной фабрикой (преобразует
 * plain-объект из БД в доменную сущность и наоборот).
 *
 * Применяется к Faculty/Department/Specialty/AcademicYear/Semester/Group.
 */
class SequelizeStructureRepository {
  /**
   * @param {Object} params
   * @param {import('sequelize').Model} params.model    Sequelize-модель
   * @param {(plain: Object) => Object} params.toDomain  Маппер БД → доменная сущность
   * @param {string} params.label                       Человекочитаемое имя ресурса
   */
  constructor({ model, toDomain, label }) {
    this.model = model;
    this.toDomain = toDomain;
    this.label = label;
  }

  async findAll(filter = {}) {
    const rows = await this.model.findAll({
      where: filter.where || undefined,
      include: filter.include || undefined,
      order: filter.order || [['id', 'ASC']],
    });
    return rows.map((r) => this.toDomain(r.get({ plain: true })));
  }

  async findById(id) {
    const row = await this.model.findByPk(id);
    return row ? this.toDomain(row.get({ plain: true })) : null;
  }

  async create(entity) {
    const row = await this.model.create(this._toPersistence(entity));
    return this.toDomain(row.get({ plain: true }));
  }

  async update(id, patch) {
    const row = await this.model.findByPk(id);
    if (!row) throw new NotFoundError(`${this.label} #${id} не найден`);
    await row.update(this._toPersistence(patch, /* partial */ true));
    return this.toDomain(row.get({ plain: true }));
  }

  async delete(id) {
    const deleted = await this.model.destroy({ where: { id } });
    if (deleted === 0) throw new NotFoundError(`${this.label} #${id} не найден`);
  }

  _toPersistence(entity, _partial = false) {
    const { id: _unused, ...rest } = entity;
    return rest;
  }
}

module.exports = SequelizeStructureRepository;
