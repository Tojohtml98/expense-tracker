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

      <p className="summary-total">
        <small>Total del mes</small>
        {formatAmount(summary.total)}
      </p>

      {summary.byCategory.length === 0 && <p className="summary-empty">Sin gastos este mes.</p>}
      <ul>
        {summary.byCategory.map((item) => {
          const pct = summary.total > 0 ? Math.round((item.total / summary.total) * 100) : 0;
          return (
            <li key={item.category}>
              <div className="summary-row">
                <span>{CATEGORY_LABELS[item.category]}</span>
                <span>{formatAmount(item.total)}</span>
              </div>
              <div className="summary-bar" role="presentation">
                <span style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
