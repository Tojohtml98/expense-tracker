// Cuentas de "Mi plata". Todo en fecha LOCAL: a las 22 h en Argentina ya es
// mañana en UTC, y "hoy" tiene que ser el día del calendario de quien la usa.

export const formatMoney = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: Math.abs(n) >= 1000 ? 0 : 2,
  }).format(n);

const pad = (n) => String(n).padStart(2, '0');

export const todayLocal = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

// Días que quedan en el mes contando hoy (el 30 de noviembre = 1)
export const daysLeftInMonth = (now = new Date()) => {
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return last - now.getDate() + 1;
};

// Plan del mes a partir de lo que te queda y lo que venís gastando.
export function monthPlan({ available, spentThisMonth, now = new Date() }) {
  const daysLeft = daysLeftInMonth(now);
  const perDay = available / daysLeft;
  const avgPerDay = spentThisMonth / now.getDate();
  const endOfMonth = available - avgPerDay * daysLeft;
  // A este ritmo, ¿hasta qué día alcanza? (null = llega a fin de mes)
  let runsOutOn = null;
  if (avgPerDay > 0 && endOfMonth < 0) {
    const days = Math.max(0, Math.floor(available / avgPerDay));
    runsOutOn = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  }
  return { daysLeft, perDay, avgPerDay, endOfMonth, runsOutOn };
}

export function simulate({ available, amount, daysLeft }) {
  const after = available - amount;
  return { after, perDay: after / daysLeft, fits: after >= 0 };
}

const DAY_FMT = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'numeric', timeZone: 'UTC' });
// "2026-11-21" → "sáb, 21/11" (fecha de calendario: se formatea en UTC para no correrla)
export const formatDay = (isoDay) => DAY_FMT.format(new Date(`${isoDay}T00:00:00Z`));
