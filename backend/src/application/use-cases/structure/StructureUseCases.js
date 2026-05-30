const { NotFoundError } = require('../../../shared/errors/AppError');

/**
 * Универсальная фабрика CRUD-use-cases для одной сущности.
 * Гарантирует SRP: каждый use case — одна операция.
 * Возвращает объект из шести функций.
 *
 * @param {Object} params
 * @param {Object} params.repository           Репозиторий с методами CRUD
 * @param {Function} params.Entity             Доменная фабрика (constructor)
 * @param {string} params.label                Имя ресурса для сообщений об ошибках
 */
function createStructureUseCases({ repository, Entity, label }) {
  async function list(filter) {
    return repository.findAll(filter);
  }

  async function getById(id) {
    const entity = await repository.findById(id);
    if (!entity) throw new NotFoundError(`${label} #${id} не найден`);
    return entity;
  }

  async function create(input) {
    const entity = new Entity(input);
    return repository.create({ ...entity });
  }

  async function update(id, input) {
    await getById(id);
    const merged = await repository.findById(id);
    const next = new Entity({ ...merged, ...input, id });
    return repository.update(id, { ...next });
  }

  async function remove(id) {
    await getById(id);
    await repository.delete(id);
  }

  return { list, getById, create, update, remove };
}

module.exports = createStructureUseCases;
