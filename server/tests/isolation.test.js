import request from 'supertest';
import app from '../src/app.js';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const as = (id) => ({
  get: (url) => request(app).get(url).set('X-Visitor-Id', id),
  post: (url, body) => request(app).post(url).set('X-Visitor-Id', id).send(body),
  put: (url, body) => request(app).put(url).set('X-Visitor-Id', id).send(body),
  del: (url) => request(app).delete(url).set('X-Visitor-Id', id),
});
const expense = { amount: 1500, category: 'food', date: '2026-08-10' };

describe('per-visitor isolation', () => {
  it('rejects requests without a valid X-Visitor-Id', async () => {
    const missing = await request(app).get('/api/expenses');
    const invalid = await request(app).get('/api/expenses').set('X-Visitor-Id', 'not-a-uuid');

    expect(missing.status).toBe(400);
    expect(invalid.status).toBe(400);
  });

  it('lists only the expenses of the current visitor', async () => {
    await as(A).post('/api/expenses', expense);
    await as(B).post('/api/expenses', { ...expense, amount: 99 });

    const res = await as(A).get('/api/expenses');

    expect(res.body.count).toBe(1);
    expect(res.body.data[0].amount).toBe(1500);
  });

  it("cannot read, edit or delete another visitor's expense", async () => {
    const { body } = await as(A).post('/api/expenses', expense);
    const url = `/api/expenses/${body.data._id}`;

    expect((await as(B).get(url)).status).toBe(404);
    expect((await as(B).put(url, { amount: 1 })).status).toBe(404);
    expect((await as(B).del(url)).status).toBe(404);

    const still = await as(A).get(url);
    expect(still.status).toBe(200);
    expect(still.body.data.amount).toBe(1500);
  });

  it('summary only adds up the current visitor', async () => {
    await as(A).post('/api/expenses', expense);
    await as(B).post('/api/expenses', { ...expense, amount: 5000 });

    const res = await as(A).get('/api/expenses/summary?month=2026-08');

    expect(res.body.data.total).toBe(1500);
  });

  it('ignores an owner sent in the body (no spoofing)', async () => {
    const created = await as(A).post('/api/expenses', { ...expense, owner: B });
    expect(created.body.data.owner).toBe(A);

    const url = `/api/expenses/${created.body.data._id}`;
    await as(A).put(url, { owner: B, amount: 2000 });

    expect((await as(B).get('/api/expenses')).body.count).toBe(0);
    expect((await as(A).get(url)).body.data.amount).toBe(2000);
  });
});
