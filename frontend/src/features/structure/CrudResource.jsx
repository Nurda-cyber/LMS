import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button, Card, Modal, Skeleton, EmptyState, Spinner } from '../../shared/ui';
import { notify } from '../../shared/lib/notify';
import {
  useStructureList,
  useCreateStructure,
  useUpdateStructure,
  useDeleteStructure,
} from './hooks';
import { getFieldsFor } from './fieldSchemas';
import { EntityForm } from './EntityForm';

/**
 * Универсальный экран CRUD ресурса структуры.
 * Параметризуется ресурсом и колонками таблицы.
 */
export function CrudResource({
  resource,
  title,
  subtitle,
  columns,
  context = {},
  emptyTitle,
  emptyDesc,
  createLabel = 'Добавить',
}) {
  const list = useStructureList(resource);
  const createMut = useCreateStructure(resource);
  const updateMut = useUpdateStructure(resource);
  const deleteMut = useDeleteStructure(resource);

  const [editing, setEditing] = useState(null); // null | 'create' | object
  const isOpen = editing !== null;

  function open(entry = null) {
    setEditing(entry ?? 'create');
  }
  function close() {
    setEditing(null);
  }

  async function handleSubmit(payload) {
    try {
      if (editing === 'create') {
        await createMut.mutateAsync(payload);
        notify.success('Создано');
      } else {
        await updateMut.mutateAsync({ id: editing.id, payload });
        notify.success('Сохранено');
      }
      close();
    } catch (err) {
      notify.fromError(err);
    }
  }

  async function handleDelete(row) {
    if (!confirm(`Удалить запись «${describe(row, columns)}»?`)) return;
    try {
      await deleteMut.mutateAsync(row.id);
      notify.success('Удалено');
    } catch (err) {
      notify.fromError(err);
    }
  }

  const fields = getFieldsFor(resource, context);
  const rows = list.data || [];

  return (
    <Card
      title={title}
      subtitle={subtitle}
      actions={
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => open()}>
          {createLabel}
        </Button>
      }
    >
      {list.isLoading ? (
        <div className="crud-skeleton">
          <Skeleton variant="text" style={{ width: '60%' }} />
          <Skeleton variant="text" style={{ width: '80%' }} />
          <Skeleton variant="text" style={{ width: '70%' }} />
        </div>
      ) : list.isError ? (
        <EmptyState title="Ошибка загрузки" description={list.error?.message} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={emptyTitle || 'Пока пусто'}
          description={emptyDesc || 'Создайте первую запись с помощью кнопки выше.'}
          action={
            <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => open()}>
              {createLabel}
            </Button>
          }
        />
      ) : (
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th style={{ width: '7rem' }} aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{renderCell(c, row, context)}</td>
                  ))}
                  <td className="crud-table__actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => open(row)}
                      aria-label="Изменить"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => handleDelete(row)}
                      aria-label="Удалить"
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={isOpen}
        onClose={close}
        title={editing === 'create' ? `Создать: ${title}` : `Изменить: ${title}`}
        size="md"
      >
        {isOpen && (
          <EntityForm
            fields={fields}
            initialValues={editing === 'create' ? {} : editing}
            onSubmit={handleSubmit}
            onCancel={close}
            submitting={createMut.isPending || updateMut.isPending}
          />
        )}
      </Modal>

      {(createMut.isPending || updateMut.isPending || deleteMut.isPending) && (
        <span className="crud-pending"><Spinner size="sm" /></span>
      )}
    </Card>
  );
}

function renderCell(column, row, context) {
  if (column.render) return column.render(row, context);
  const value = row[column.key];
  if (value === null || value === undefined || value === '') return <span className="muted">—</span>;
  return String(value);
}

function describe(row, columns) {
  const titleCol = columns.find((c) => c.key === 'name' || c.key === 'code') || columns[0];
  return titleCol ? row[titleCol.key] : `#${row.id}`;
}
