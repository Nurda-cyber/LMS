import { useEffect, useState } from 'react';
import { Button } from '../../shared/ui';

/**
 * Универсальная форма для CRUD сущности.
 * Поля и их типы описаны декларативно (см. fieldSchemas.js).
 */
export function EntityForm({ fields, initialValues = {}, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(() => buildInitial(fields, initialValues));
  const [errorByField, setErrorByField] = useState({});

  useEffect(() => {
    setValues(buildInitial(fields, initialValues));
    setErrorByField({});
  }, [fields, initialValues]);

  function setField(name, v) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errors = {};
    for (const f of fields) {
      const v = values[f.name];
      if (f.required && (v === '' || v === null || v === undefined)) {
        errors[f.name] = 'Заполните поле';
      }
    }
    if (Object.keys(errors).length) {
      setErrorByField(errors);
      return;
    }
    const payload = serialize(fields, values);
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {fields.map((f) => (
        <label key={f.name} className="entity-form__field">
          <span className="entity-form__label">
            {f.label}
            {f.required && <span className="entity-form__required">*</span>}
          </span>
          {renderInput(f, values[f.name], (v) => setField(f.name, v))}
          {errorByField[f.name] && (
            <span className="entity-form__error">{errorByField[f.name]}</span>
          )}
        </label>
      ))}

      <div className="entity-form__actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Сохранить
        </Button>
      </div>
    </form>
  );
}

function renderInput(field, value, onChange) {
  const common = {
    id: `field-${field.name}`,
    name: field.name,
    className: 'entity-form__control',
  };

  if (field.type === 'textarea') {
    return (
      <textarea
        {...common}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    );
  }
  if (field.type === 'number') {
    return (
      <input
        {...common}
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        min={field.min}
        max={field.max}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select
        {...common}
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === '' ? '' : isNaN(Number(raw)) || /^[^\d]/.test(raw) ? raw : Number(raw));
        }}
      >
        <option value="">— Не выбрано —</option>
        {(field.options || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === 'boolean') {
    return (
      <span className="entity-form__switch">
        <input
          {...common}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{value ? 'Да' : 'Нет'}</span>
      </span>
    );
  }
  if (field.type === 'date') {
    return (
      <input
        {...common}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      />
    );
  }

  return (
    <input
      {...common}
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function buildInitial(fields, initial) {
  const result = {};
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(initial, f.name)) {
      result[f.name] = initial[f.name];
    } else if (f.defaultValue !== undefined) {
      result[f.name] = f.defaultValue;
    } else if (f.type === 'boolean') {
      result[f.name] = false;
    } else {
      result[f.name] = '';
    }
  }
  return result;
}

function serialize(fields, values) {
  const out = {};
  for (const f of fields) {
    const v = values[f.name];
    if (v === '' || v === null || v === undefined) {
      if (f.required) out[f.name] = v;
      continue;
    }
    out[f.name] = v;
  }
  return out;
}
