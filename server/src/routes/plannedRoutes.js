import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  getPlanned,
  createPlanned,
  updatePlanned,
  deletePlanned,
  payPlanned,
  plannedFromExpense,
} from '../controllers/plannedController.js';

const router = Router();

router.get('/', asyncHandler(getPlanned));
router.post('/', asyncHandler(createPlanned));
router.post('/from-expense/:expenseId', asyncHandler(plannedFromExpense));
router.patch('/:id', asyncHandler(updatePlanned));
router.delete('/:id', asyncHandler(deletePlanned));
router.post('/:id/pay', asyncHandler(payPlanned));

export default router;
