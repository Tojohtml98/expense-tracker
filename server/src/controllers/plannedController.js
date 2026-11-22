import { PlannedExpense } from '../models/PlannedExpense.js';
import { Expense } from '../models/Expense.js';
import { AppError } from '../middlewares/errorHandler.js';

const EDITABLE = ['description', 'amount', 'category', 'included'];
const pick = (body = {}) =>
  Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// Siempre ordenados igual: los más caros arriba, y a igual monto el más viejo primero
export const getPlanned = async (req, res) => {
  const planned = await PlannedExpense.find({ owner: req.visitorId }).sort({ amount: -1, createdAt: 1 });
  res.json({ success: true, count: planned.length, data: planned });
};

export const createPlanned = async (req, res) => {
  const planned = await PlannedExpense.create({ ...pick(req.body), owner: req.visitorId });
  res.status(201).json({ success: true, data: planned });
};

export const updatePlanned = async (req, res, next) => {
  const planned = await PlannedExpense.findOneAndUpdate({ _id: req.params.id, owner: req.visitorId }, pick(req.body), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!planned) return next(new AppError('Planned expense not found', 404));
  res.json({ success: true, data: planned });
};

export const deletePlanned = async (req, res, next) => {
  const planned = await PlannedExpense.findOneAndDelete({ _id: req.params.id, owner: req.visitorId });
  if (!planned) return next(new AppError('Planned expense not found', 404));
  res.json({ success: true, data: {} });
};

// "Pagado": pasa a ser un gasto real con la fecha que manda el cliente (su día local)
export const payPlanned = async (req, res, next) => {
  const date = req.body?.date;
  if (!DAY_RE.test(date ?? '')) return next(new AppError('date must be YYYY-MM-DD', 400));

  const planned = await PlannedExpense.findOne({ _id: req.params.id, owner: req.visitorId });
  if (!planned) return next(new AppError('Planned expense not found', 404));

  const expense = await Expense.create({
    owner: req.visitorId,
    amount: planned.amount,
    category: planned.category,
    description: planned.description,
    date,
  });
  await planned.deleteOne();
  res.status(201).json({ success: true, data: expense });
};

// Al revés: un gasto que anotaste pero todavía no pagaste vuelve a "supuestos"
export const plannedFromExpense = async (req, res, next) => {
  const expense = await Expense.findOne({ _id: req.params.expenseId, owner: req.visitorId });
  if (!expense) return next(new AppError('Expense not found', 404));

  const planned = await PlannedExpense.create({
    owner: req.visitorId,
    description: expense.description || 'Sin descripción',
    amount: expense.amount,
    category: expense.category,
  });
  await expense.deleteOne();
  res.status(201).json({ success: true, data: planned });
};
