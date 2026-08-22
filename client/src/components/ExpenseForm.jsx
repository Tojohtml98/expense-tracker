import { useState } from 'react';
import { CATEGORIES, CATEGORY_LABELS } from '../constants.js';

const emptyForm = {
  amount: '',
  category: CATEGORIES[0],
  description: '',
  date: new Date().toISOString().slice(0, 10),
};

export function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onAdd({ ...form, amount: Number(form.amount) });
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>Agregar gasto</h2>

      <label>
        Monto
        <input
          type="number"
          name="amount"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Categoría
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Descripción
        <input
          type="text"
          name="description"
          maxLength={200}
          value={form.description}
          onChange={handleChange}
        />
      </label>

      <label>
        Fecha
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Guardando...' : 'Agregar'}
      </button>

      {error && <p className="error">{error}</p>}
    </form>
  );
}
