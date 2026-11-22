import { visitorId } from './device.js';

const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', 'X-Visitor-Id': visitorId() },
    ...options,
  });
  // Si la API no devuelve JSON (caída, despertando, URL mal configurada),
  // mostramos un mensaje entendible en vez de "Unexpected token '<'".
  const body = await res.json().catch(() => {
    throw new Error('No pudimos conectar con el servidor. Probá de nuevo en unos segundos.');
  });

  if (!res.ok) {
    throw new Error(body.message || 'Request failed');
  }
  return body.data;
}

export const getExpenses = ({ month, category }) => {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (category) params.set('category', category);
  return request(`/expenses?${params}`);
};

export const getSummary = (month) => request(`/expenses/summary?month=${month}`);

export const createExpense = (expense) =>
  request('/expenses', { method: 'POST', body: JSON.stringify(expense) });

export const updateExpense = (id, expense) =>
  request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expense) });

export const deleteExpense = (id) => request(`/expenses/${id}`, { method: 'DELETE' });

// ---- "Mi plata": cuánto tengo hoy ----
export const getBalance = () => request('/balances');

export const saveBalance = (date, amount) =>
  request(`/balances/${date}`, { method: 'PUT', body: JSON.stringify({ amount }) });

// ---- Supuestos gastos ----
export const getPlanned = () => request('/planned');

export const createPlanned = (planned) =>
  request('/planned', { method: 'POST', body: JSON.stringify(planned) });

export const updatePlanned = (id, changes) =>
  request(`/planned/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });

export const deletePlanned = (id) => request(`/planned/${id}`, { method: 'DELETE' });

export const payPlanned = (id, date) =>
  request(`/planned/${id}/pay`, { method: 'POST', body: JSON.stringify({ date }) });

export const plannedFromExpense = (expenseId) =>
  request(`/planned/from-expense/${expenseId}`, { method: 'POST' });
