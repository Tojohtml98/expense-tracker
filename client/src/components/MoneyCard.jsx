import { useState } from 'react';
import { formatDay, formatMoney, monthPlan, simulate } from '../money.js';

const DATE_FMT = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' });

function Sparkline({ history }) {
  if (history.length < 2) {
    return <p className="money-spark-empty">Cargá tu plata un par de días y acá ves cómo va.</p>;
  }
  const W = 300;
  const H = 64;
  const values = history.map((h) => h.amount);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    max === min ? H / 2 : H - 4 - ((v - min) / range) * (H - 8),
  ]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const first = history[0];
  const last = history[history.length - 1];
  return (
    <figure className="money-spark">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Tu plata del ${formatDay(first.date)} al ${formatDay(last.date)}: de ${formatMoney(first.amount)} a ${formatMoney(last.amount)}`}
      >
        <defs>
          <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${H} ${line} ${W},${H}`} fill="url(#spark-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <figcaption>
        <span>{formatDay(first.date)}</span>
        <span>{history.length} días cargados</span>
        <span>{formatDay(last.date)}</span>
      </figcaption>
    </figure>
  );
}

export function MoneyCard({ balance, loading, onSave, spentThisMonth }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [whatIf, setWhatIf] = useState('');

  const { latest, estimated, spentSince, history } = balance;
  const hasBalance = latest !== null && estimated !== null;
  const plan = hasBalance ? monthPlan({ available: estimated, spentThisMonth: spentThisMonth ?? 0 }) : null;
  const whatIfNum = Number(whatIf);
  const sim =
    hasBalance && whatIf !== '' && whatIfNum > 0
      ? simulate({ available: estimated, amount: whatIfNum, daysLeft: plan.daysLeft })
      : null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await onSave(Number(amount));
      setAmount('');
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  let subtitle = 'Cargá cuánto tenés hoy y te digo cuánto podés gastar por día.';
  if (hasBalance) {
    subtitle =
      spentSince > 0
        ? `Tenías ${formatMoney(latest.amount)} el ${formatDay(latest.date)} · desde ahí gastaste ${formatMoney(spentSince)}`
        : `Lo que cargaste el ${formatDay(latest.date)}`;
  }

  return (
    <section className="money" aria-labelledby="money-title">
      <div className="money-top">
        <div className="money-now">
          <h2 id="money-title">Te queda</h2>
          <p className="money-big" aria-live="polite">
            {loading && !hasBalance ? <span className="money-skeleton" /> : hasBalance ? formatMoney(estimated) : '—'}
          </p>
          <p className="money-sub">{subtitle}</p>
        </div>

        <form className="money-form" onSubmit={submit}>
          <label htmlFor="money-today">¿Cuánto tenés hoy?</label>
          <div className="money-input">
            <span aria-hidden="true">$</span>
            <input
              id="money-today"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder={hasBalance ? String(Math.round(estimated)) : '0'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button type="submit" disabled={saving || amount === ''}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
          {saveError && <p className="money-error">{saveError}</p>}
        </form>
      </div>

      {hasBalance && (
        <>
          <dl className="money-stats">
            <div>
              <dt>Podés gastar por día</dt>
              <dd className={plan.perDay < 0 ? 'is-bad' : ''}>{formatMoney(plan.perDay)}</dd>
            </div>
            <div>
              <dt>Días que quedan</dt>
              <dd>{plan.daysLeft}</dd>
            </div>
            {spentThisMonth !== null && plan.avgPerDay > 0 && (
              <div>
                <dt>A tu ritmo ({formatMoney(plan.avgPerDay)}/día)</dt>
                <dd className={plan.runsOutOn ? 'is-bad' : 'is-good'}>
                  {plan.runsOutOn
                    ? `Te alcanza hasta el ${DATE_FMT.format(plan.runsOutOn)}`
                    : `Llegás con ${formatMoney(plan.endOfMonth)}`}
                </dd>
              </div>
            )}
          </dl>

          <Sparkline history={history} />

          <div className="money-sim">
            <label htmlFor="money-whatif">¿Me lo puedo gastar?</label>
            <div className="money-input">
              <span aria-hidden="true">$</span>
              <input
                id="money-whatif"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="Probá un monto"
                value={whatIf}
                onChange={(e) => setWhatIf(e.target.value)}
              />
            </div>
            {sim && (
              <p className={`money-sim-result ${sim.fits ? 'is-good' : 'is-bad'}`} aria-live="polite">
                {sim.fits
                  ? `Sí: te quedarían ${formatMoney(sim.after)} → ${formatMoney(sim.perDay)} por día hasta fin de mes.`
                  : `No te alcanza: te faltarían ${formatMoney(-sim.after)}.`}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
