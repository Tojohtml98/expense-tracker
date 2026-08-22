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

      {loading && <p>Cargando...</p>}
      {!loading && expenses.length === 0 && <p>No hay gastos cargados.</p>}

      <ul>
        {expenses.map((expense) => (
          <li key={expense._id}>
            <span className="expense-date">{formatDate(expense.date)}</span>
            <span className="expense-category">{CATEGORY_LABELS[expense.category]}</span>
            <span className="expense-description">{expense.description}</span>
            <span className="expense-amount">{formatAmount(expense.amount)}</span>
            <button onClick={() => onDelete(expense._id)} aria-label="Eliminar gasto">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
