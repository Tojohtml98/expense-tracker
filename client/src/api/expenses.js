const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();

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
