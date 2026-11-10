import request from 'supertest';
import app from '../src/app.js';

const VISITOR = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';
const api = {
  get: (url) => request(app).get(url).set('X-Visitor-Id', VISITOR),
  post: (url) => request(app).post(url).set('X-Visitor-Id', VISITOR),
};

const validExpense = {
  amount: 2500,
  category: 'food',
  description: 'Supermercado',
  date: '2026-08-10',
};

describe('POST /api/expenses', () => {
  it('creates an expense with valid data', async () => {
    const res = await api.post('/api/expenses').send(validExpense);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(2500);
    expect(res.body.data.category).toBe('food');
  });

  it('rejects an invalid category with 400', async () => {
    const res = await api
      .post('/api/expenses')
      .send({ ...validExpense, category: 'not-a-real-category' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/expenses/summary', () => {
  it('returns total and total by category for the given month', async () => {
    await api.post('/api/expenses').send(validExpense);
    await api
      .post('/api/expenses')
      .send({ amount: 1000, category: 'transport', date: '2026-08-15' });
    // Fuera del mes filtrado, no debería contar
    await api
      .post('/api/expenses')
      .send({ amount: 999, category: 'food', date: '2026-07-01' });

    const res = await api.get('/api/expenses/summary?month=2026-08');

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(3500);
    expect(res.body.data.byCategory).toEqual(
      expect.arrayContaining([
        { category: 'food', total: 2500 },
        { category: 'transport', total: 1000 },
      ])
    );
  });
});
