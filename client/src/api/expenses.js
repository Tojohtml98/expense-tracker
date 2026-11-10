const API_URL = import.meta.env.VITE_API_URL;

// Identificador anónimo de este navegador: la API devuelve solo los gastos de este ID,
// así cada visitante tiene su propia planilla sin crear cuenta.
const VISITOR_KEY = 'expense-tracker:visitor';
let memoryId;

function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    // Modo privado / storage bloqueado: dura lo que dure la pestaña
    memoryId ??= crypto.randomUUID();
    return memoryId;
  }
}

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
