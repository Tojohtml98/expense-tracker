import { Balance } from '../models/Balance.js';
import { Expense } from '../models/Expense.js';
import { AppError } from '../middlewares/errorHandler.js';

const HISTORY_DAYS = 30;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(value) {
  if (!DAY_RE.test(value ?? '')) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

// Saldo estimado = último saldo cargado − gastos cargados DESPUÉS de guardarlo
// (y con fecha de ese día en adelante). Así un gasto viejo que se carga tarde
// no se descuenta dos veces: ya estaba reflejado en la plata que tenías.
export const getBalance = async (req, res) => {
  const owner = req.visitorId;
  const history = await Balance.find({ owner }).sort({ date: -1 }).limit(HISTORY_DAYS).lean();
  const latest = history[0] ?? null;

  let spentSince = 0;
  if (latest) {
    const [agg] = await Expense.aggregate([
      { $match: { owner, date: { $gte: latest.date }, createdAt: { $gt: latest.updatedAt } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    spentSince = agg?.total ?? 0;
  }

  const toDto = (b) => ({ date: b.date.toISOString().slice(0, 10), amount: b.amount });

  res.json({
    success: true,
    data: {
      latest: latest && { ...toDto(latest), updatedAt: latest.updatedAt },
      spentSince,
      estimated: latest ? latest.amount - spentSince : null,
      history: history.reverse().map(toDto),
    },
  });
};

export const upsertBalance = async (req, res, next) => {
  const date = parseDay(req.params.date);
  if (!date) return next(new AppError('date must be YYYY-MM-DD', 400));

  const amount = Number(req.body?.amount);
  if (req.body?.amount === undefined || req.body?.amount === '' || !Number.isFinite(amount)) {
    return next(new AppError('amount must be a number', 400));
  }

  const balance = await Balance.findOneAndUpdate(
    { owner: req.visitorId, date },
    { $set: { amount }, $setOnInsert: { owner: req.visitorId, date } },
    { returnDocument: 'after', upsert: true, runValidators: true }
  );
  res.json({ success: true, data: { date: req.params.date, amount: balance.amount } });
};

export const deleteBalance = async (req, res, next) => {
  const date = parseDay(req.params.date);
  if (!date) return next(new AppError('date must be YYYY-MM-DD', 400));
  const deleted = await Balance.findOneAndDelete({ owner: req.visitorId, date });
  if (!deleted) return next(new AppError('Balance not found', 404));
  res.json({ success: true, data: {} });
};
