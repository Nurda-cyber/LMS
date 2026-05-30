import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button, Card, Spinner, EmptyState } from '../../shared/ui';
import { notify } from '../../shared/lib/notify';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './hooks';

/**
 * Inline-редактор категорий оценивания для конкретного курса.
 * Категории и веса сразу видны в одной таблице, можно редактировать
 * и сохранять (массовое сохранение через useUpdateCategory по каждой строке).
 */
export function CategoriesEditor({ courseId }) {
  const list = useCategories(courseId);
  const createMut = useCreateCategory(courseId);
  const updateMut = useUpdateCategory(courseId);
  const deleteMut = useDeleteCategory(courseId);

  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    if (list.data) {
      setDrafts(list.data.map((c) => ({ ...c, dirty: false })));
    }
  }, [list.data]);

  const sum = useMemo(
    () => drafts.reduce((s, c) => s + (Number(c.weight) || 0), 0),
    [drafts]
  );

  function setField(id, field, value) {
    setDrafts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value, dirty: true } : c))
    );
  }

  async function handleAdd() {
    try {
      await createMut.mutateAsync({ name: 'Новая категория', weight: 0 });
      notify.success('Категория добавлена');
    } catch (err) {
      notify.fromError(err);
    }
  }

  async function handleSave(c) {
    try {
      await updateMut.mutateAsync({
        id: c.id,
        payload: { name: c.name, weight: Number(c.weight) || 0 },
      });
      notify.success('Сохранено');
    } catch (err) {
      notify.fromError(err);
    }
  }

  async function handleDelete(c) {
    if (!confirm(`Удалить категорию «${c.name}»?`)) return;
    try {
      await deleteMut.mutateAsync(c.id);
      notify.success('Удалено');
    } catch (err) {
      notify.fromError(err);
    }
  }

  if (list.isLoading) {
    return (
      <Card title="Категории оценок"><Spinner /></Card>
    );
  }

  return (
    <Card
      title="Категории оценок"
      subtitle="Назначьте вес каждой категории. Сумма весов всех категорий должна быть равна 100%."
      actions={
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleAdd} loading={createMut.isPending}>
          Добавить категорию
        </Button>
      }
    >
      {drafts.length === 0 ? (
        <EmptyState
          title="Категорий пока нет"
          description="Создайте, например: Домашние задания (30%), Тесты (20%), Экзамен (50%)."
        />
      ) : (
        <div className="categories-editor">
          {drafts.map((c) => (
            <div key={c.id} className="categories-editor__row">
              <input
                className="entity-form__control"
                value={c.name}
                onChange={(e) => setField(c.id, 'name', e.target.value)}
              />
              <input
                className="entity-form__control"
                type="number"
                min="0"
                max="100"
                step="1"
                value={c.weight}
                onChange={(e) => setField(c.id, 'weight', e.target.value)}
              />
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Save size={14} />}
                onClick={() => handleSave(c)}
                disabled={!c.dirty}
                loading={updateMut.isPending}
              >
                Сохранить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                onClick={() => handleDelete(c)}
                aria-label="Удалить"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <div className={`categories-editor__sum ${sum !== 100 ? 'categories-editor__sum--bad' : ''}`}>
            Сумма весов: {sum}% {sum !== 100 && '— должна быть 100%'}
          </div>
        </div>
      )}
    </Card>
  );
}
