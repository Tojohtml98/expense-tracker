import { Expense } from '../models/Expense.js';
import { AppError } from '../middlewares/errorHandler.js';

function monthRange(monthParam) {
  const [year, month] = monthParam
    ? monthParam.split('-').map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

// Solo estos campos vienen del cliente: owner sale del header, nunca del body.
const EDITABLE = ['amount', 'category', 'description', 'date'];
const pick = (body = {}) =>
  Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

export const getExpenses = async (req, res) => {
  const { month, category } = req.query;
  const filter = { owner: req.visitorId };

  if (month) {
    const { start, end } = monthRange(month);
    filter.date = { $gte: start, $lt: end };
  }
  if (category) {
    filter.category = category;
  }

  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json({ success: true, count: expenses.length, data: expenses });
};

export const getExpenseById = async (req, res, next) => {
  const expense = await Expense.findOne({ _id: req.params.id, owner: req.visitorId });
  if (!expense) return next(new AppError('Expense not found', 404));
  res.json({ success: true, data: expense });
};

export const createExpense = async (req, res) => {
  const expense = await Expense.create({ ...pick(req.body), owner: req.visitorId });
  res.status(201).json({ success: true, data: expense });
};

export const updateExpense = async (req, res, next) => {
  const expense = await Expense.findOneAndUpdate({ _id: req.params.id, owner: req.visitorId }, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!expense) return next(new AppError('Expense not found', 404));
  res.json({ success: true, data: expense });
};

export const deleteExpense = async (req, res, next) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, owner: req.visitorId });
  if (!expense) return next(new AppError('Expense not found', 404));
  res.json({ success: true, data: {} });
};

export const getSummary = async (req, res) => {
  const { start, end } = monthRange(req.query.month);

  const byCategory = await Expense.aggregate([
    { $match: { owner: req.visitorId, date: { $gte: start, $lt: end } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
  ]);

  const total = byCategory.reduce((sum, c) => sum + c.total, 0);

  res.json({
    success: true,
    data: {
      total,
      byCategory: byCategory.map((c) => ({ category: c._id, total: c.total })),
    },
  });
};
