import { CATEGORY_LABELS } from '../constants.js';

const formatAmount = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

export function Summary({ summary, month, onMonthChange }) {
  return (
    <section className="summary">
      <div className="summary-header">
        <h2>Resumen</h2>
        <input type="month" value={month} onChange={(e) => onMonthChange(e.target.value)} />
      </div>

      <p className="summary-total">Total: {formatAmount(summary.total)}</p>

      <ul>
        {summary.byCategory.map((item) => (
          <li key={item.category}>
            <span>{CATEGORY_LABELS[item.category]}</span>
            <span>{formatAmount(item.total)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
