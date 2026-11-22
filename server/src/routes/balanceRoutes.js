import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getBalance, upsertBalance, deleteBalance } from '../controllers/balanceController.js';

const router = Router();

router.get('/', asyncHandler(getBalance));
router.put('/:date', asyncHandler(upsertBalance));
router.delete('/:date', asyncHandler(deleteBalance));

export default router;
