import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
} from '../controllers/expenseController.js';

const router = Router();

router.get('/summary', asyncHandler(getSummary));
router.get('/', asyncHandler(getExpenses));
router.get('/:id', asyncHandler(getExpenseById));
router.post('/', asyncHandler(createExpense));
router.put('/:id', asyncHandler(updateExpense));
router.delete('/:id', asyncHandler(deleteExpense));

export default router;
