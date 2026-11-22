import express from 'express';
import cors from 'cors';
import expenseRoutes from './routes/expenseRoutes.js';
import balanceRoutes from './routes/balanceRoutes.js';
import plannedRoutes from './routes/plannedRoutes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import { requireVisitor } from './middlewares/visitor.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/expenses', requireVisitor, expenseRoutes);
app.use('/api/balances', requireVisitor, balanceRoutes);
app.use('/api/planned', requireVisitor, plannedRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
