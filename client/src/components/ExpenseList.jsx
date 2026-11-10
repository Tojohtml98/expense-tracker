import { CATEGORIES, CATEGORY_LABELS } from '../constants.js';

const formatAmount = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

// La fecha viaja como medianoche UTC (fecha de calendario, sin hora): formatear
// en zona local la corre un día para atrás, así que se muestra fija en UTC.
const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString('es-AR', { timeZone: 'UTC' });

export function ExpenseList({ expenses, category, onCategoryChange, onDelete, loading }) {
  return (
    <section className="expense-list">
      <div className="expense-list-header">
        <h2>Gastos del mes</h2>
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="list-status">Cargando gastos…</p>}
      {!loading && expenses.length === 0 && <p className="list-status">Todavía no hay gastos este mes.</p>}

      <ul>
        {expenses.map((expense) => (
          <li key={expense._id}>
            <span className="expense-meta">
              {formatDate(expense.date)} · {CATEGORY_LABELS[expense.category]}
            </span>
            <span className="expense-description">{expense.description}</span>
            <span className="expense-amount">{formatAmount(expense.amount)}</span>
            <button
              className="expense-delete"
              onClick={() => onDelete(expense._id)}
              aria-label="Eliminar gasto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
