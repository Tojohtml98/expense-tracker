import request from 'supertest';
import app from '../src/app.js';
import { Balance } from '../src/models/Balance.js';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const as = (id) => ({
  get: (url) => request(app).get(url).set('X-Visitor-Id', id),
  post: (url, body) => request(app).post(url).set('X-Visitor-Id', id).send(body),
  put: (url, body) => request(app).put(url).set('X-Visitor-Id', id).send(body),
  del: (url) => request(app).delete(url).set('X-Visitor-Id', id),
});

describe('balances (cuánto tengo hoy)', () => {
  beforeAll(() => Balance.init()); // índice único listo antes de los upserts

  it('starts empty', async () => {
    const res = await as(A).get('/api/balances');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ latest: null, spentSince: 0, estimated: null, history: [] });
  });

  it('saves one balance per day and overwrites it the same day', async () => {
    await as(A).put('/api/balances/2026-11-21', { amount: 50000 });
    await as(A).put('/api/balances/2026-11-22', { amount: 40000 });
    const again = await as(A).put('/api/balances/2026-11-22', { amount: 42000 });
    expect(again.status).toBe(200);

    const { body } = await as(A).get('/api/balances');
    expect(body.data.history).toEqual([
      { date: '2026-11-21', amount: 50000 },
      { date: '2026-11-22', amount: 42000 },
    ]);
    expect(body.data.latest).toMatchObject({ date: '2026-11-22', amount: 42000 });
  });

  it('subtracts only expenses added after the balance was saved', async () => {
    // Gasto viejo cargado antes del saldo: ya está reflejado en la plata, no se descuenta
    await as(A).post('/api/expenses', { amount: 999, category: 'food', date: '2026-11-22' });
    await as(A).put('/api/balances/2026-11-22', { amount: 30000 });
    await as(A).post('/api/expenses', { amount: 2500, category: 'food', date: '2026-11-22' });
    await as(A).post('/api/expenses', { amount: 500, category: 'transport', date: '2026-11-23' });
    // Cargado después pero con fecha anterior al saldo: tampoco se descuenta
    await as(A).post('/api/expenses', { amount: 7000, category: 'other', date: '2026-11-20' });

    const { body } = await as(A).get('/api/balances');
    expect(body.data.spentSince).toBe(3000);
    expect(body.data.estimated).toBe(27000);
  });

  it('keeps each visitor balances separate', async () => {
    await as(A).put('/api/balances/2026-11-22', { amount: 30000 });
    const res = await as(B).get('/api/balances');
    expect(res.body.data.latest).toBeNull();
    expect((await as(B).del('/api/balances/2026-11-22')).status).toBe(404);
  });

  it('validates date and amount', async () => {
    expect((await as(A).put('/api/balances/22-11-2026', { amount: 1 })).status).toBe(400);
    expect((await as(A).put('/api/balances/2026-02-31', { amount: 1 })).status).toBe(400);
    expect((await as(A).put('/api/balances/2026-11-22', { amount: 'mucho' })).status).toBe(400);
    expect((await as(A).put('/api/balances/2026-11-22', {})).status).toBe(400);
  });

  it('deletes a day', async () => {
    await as(A).put('/api/balances/2026-11-22', { amount: 30000 });
    expect((await as(A).del('/api/balances/2026-11-22')).status).toBe(200);
    expect((await as(A).get('/api/balances')).body.data.latest).toBeNull();
  });
});
