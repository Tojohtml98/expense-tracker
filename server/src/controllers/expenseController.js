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

export const getExpenses = async (req, res) => {
  const { month, category } = req.query;
  const filter = {};

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
  const expense = await Expense.findById(req.params.id);
  if (!expense) return next(new AppError('Expense not found', 404));
  res.json({ success: true, data: expense });
};

export const createExpense = async (req, res) => {
  const expense = await Expense.create(req.body);
  res.status(201).json({ success: true, data: expense });
};

export const updateExpense = async (req, res, next) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!expense) return next(new AppError('Expense not found', 404));
  res.json({ success: true, data: expense });
};

export const deleteExpense = async (req, res, next) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return next(new AppError('Expense not found', 404));
  res.json({ success: true, data: {} });
};

export const getSummary = async (req, res) => {
  const { start, end } = monthRange(req.query.month);

  const byCategory = await Expense.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
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
