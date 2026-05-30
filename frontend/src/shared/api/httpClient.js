import { HttpError } from './HttpError';

const API_BASE = '/api';
const TOKEN_KEY = 'token';

const listeners = new Set();

/**
 * Подписка на глобальные события HTTP (например, 401 → разлогин).
 * Возвращает функцию отписки.
 */
export function onHttpEvent(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

function emit(event) {
  for (const fn of listeners) {
    try {
      fn(event);
    } catch {
      // подписчики не должны ломать запрос
    }
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function buildHeaders(custom = {}, { auth = true, isFormData = false } = {}) {
  const headers = { Accept: 'application/json', ...custom };
  if (!isFormData) headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Единая точка входа для всех HTTP-запросов.
 * Бросает HttpError при не-2xx ответе; иначе возвращает распарсенное тело.
 */
export async function request(method, path, { body, query, headers, auth = true, signal } = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (query && typeof query === 'object') {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, String(v));
    }
  }

  const isFormData = body instanceof FormData;
  const init = {
    method,
    headers: buildHeaders(headers, { auth, isFormData }),
    signal,
  };

  if (body !== undefined && body !== null) {
    init.body = isFormData ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url.toString().replace(window.location.origin, ''), init);
  } catch (err) {
    throw new HttpError(err?.message || 'Сеть недоступна', { status: 0, code: 'NETWORK_ERROR' });
  }

  if (res.status === 204) return null;

  const data = await parseResponse(res);

  if (!res.ok) {
    const message = data?.error || data?.message || `Ошибка ${res.status}`;
    const httpError = new HttpError(message, {
      status: res.status,
      code: data?.code || 'HTTP_ERROR',
      details: data?.details || null,
    });

    if (res.status === 401) emit({ type: 'unauthorized', error: httpError });

    throw httpError;
  }

  return data;
}

export const http = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
};
