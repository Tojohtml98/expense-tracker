import { useState } from 'react';
import { CATEGORIES, CATEGORY_LABELS } from '../constants.js';
import { comparePlanned, daysLeftInMonth, formatMoney } from '../money.js';

const emptyForm = { description: '', amount: '', category: 'other' };

export function PlannedCard({ available, planned, loading, onAdd, onToggle, onPay, onRemove }) {
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(null); // id del ítem que se está guardando
  const [error, setError] = useState('');

  const cmp = comparePlanned({ available, planned, daysLeft: daysLeftInMonth() });
  // Orden fijo: primero los que cuentan (más caro arriba), los destildados al fondo
  const sorted = [...planned].sort((a, b) => Number(b.included) - Number(a.included) || b.amount - a.amount);
  const short = cmp.after !== null && cmp.after < 0;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const run = async (id, fn) => {
    setBusy(id);
    setError('');
    try {
      await fn();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const ok = await run('new', () => onAdd({ ...form, amount: Number(form.amount) }));
    if (ok) setForm(emptyForm);
  };

  return (
    <section className="planned" aria-labelledby="planned-title">
      <header className="planned-header">
        <h2 id="planned-title">Supuestos gastos</h2>
        <p>Lo que pensás gastar. No se descuenta de tu plata hasta que tocás «Pagado».</p>
      </header>

      {/* Tengo − Supuestos = Tendría */}
      <div className="planned-compare">
        <div className="planned-box">
          <span className="planned-box-label">Tengo</span>
          <strong>{available === null ? '—' : formatMoney(available)}</strong>
          <small>{available === null ? 'Cargá cuánto tenés arriba' : 'hoy'}</small>
        </div>
        <span className="planned-op" aria-hidden="true">−</span>
        <div className="planned-box">
          <span className="planned-box-label">Supuestos</span>
          <strong>{formatMoney(cmp.total)}</strong>
          <small>{cmp.count === 1 ? '1 gasto' : `${cmp.count} gastos`}</small>
        </div>
        <span className="planned-op" aria-hidden="true">=</span>
        <div className={`planned-box planned-box-result ${short ? 'is-bad' : ''}`}>
          <span className="planned-box-label">Tendría</span>
          <strong aria-live="polite">{cmp.after === null ? '—' : formatMoney(cmp.after)}</strong>
          <small>
            {cmp.after === null
              ? 'después de los supuestos'
              : short
                ? `Te faltarían ${formatMoney(-cmp.after)}`
                : `≈ ${formatMoney(cmp.perDay)} por día hasta fin de mes`}
          </small>
        </div>
      </div>

      <form className="planned-form" onSubmit={submit}>
        <label className="planned-field planned-field-desc">
          <span>Qué</span>
          <input name="description" value={form.description} onChange={change} maxLength={100}
            placeholder="Ej: dentista, regalo, zapatillas" required />
        </label>
        <label className="planned-field">
          <span>Monto</span>
          <input name="amount" type="number" inputMode="decimal" min="0.01" step="0.01"
            value={form.amount} onChange={change} placeholder="0" required />
        </label>
        <label className="planned-field">
          <span>Categoría</span>
          <select name="category" value={form.category} onChange={change}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={busy === 'new'}>{busy === 'new' ? 'Agregando…' : 'Agregar'}</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && planned.length === 0 && <p className="list-status">Cargando…</p>}
      {!loading && planned.length === 0 && (
        <p className="list-status">
          Todavía no anotaste supuestos. Si algo de «Gastos del mes» todavía no lo pagaste, pasalo acá con la flecha ↑.
        </p>
      )}

      {planned.length > 0 && (
        <>
          <ul className="planned-list">
            {sorted.map((p) => (
              <li key={p._id} className={p.included ? '' : 'is-off'}>
                <input
                  type="checkbox"
                  checked={p.included}
                  onChange={(e) => onToggle(p._id, e.target.checked)}
                  aria-label={`Contar «${p.description}» en la cuenta`}
                  title="Destildalo para sacarlo de la cuenta sin borrarlo"
                />
                <span className="planned-desc">
                  {p.description}
                  <small>{CATEGORY_LABELS[p.category]}</small>
                </span>
                <span className="planned-amount">{formatMoney(p.amount)}</span>
                <span className="planned-actions">
                  <button type="button" className="planned-pay" disabled={busy === p._id}
                    onClick={() => run(p._id, () => onPay(p._id))}
                    title="Ya lo pagué: pasa a Gastos del mes y se descuenta">
                    Pagado
                  </button>
                  <button type="button" className="planned-remove" disabled={busy === p._id}
                    onClick={() => run(p._id, () => onRemove(p._id))} aria-label={`Borrar «${p.description}»`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="planned-total">
            <span>Total tildado</span>
            <strong>{formatMoney(cmp.total)}</strong>
          </p>
        </>
      )}
    </section>
  );
}
