/**
 * Контракт (порт) репозитория для сущностей структуры университета.
 * Не зависит от ORM/БД — описывает только методы, нужные use-cases.
 *
 * Конкретные реализации (Sequelize, in-memory) предоставляются адаптерами
 * в слое infrastructure.
 *
 * @typedef {Object} StructureRepository
 * @property {(filter?: Object) => Promise<Array<Object>>} findAll
 * @property {(id: number) => Promise<Object|null>} findById
 * @property {(entity: Object) => Promise<Object>} create
 * @property {(id: number, patch: Object) => Promise<Object>} update
 * @property {(id: number) => Promise<void>} delete
 */

module.exports = {};
