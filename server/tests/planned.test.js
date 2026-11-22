import request from 'supertest';
import app from '../src/app.js';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const as = (id) => ({
  get: (url) => request(app).get(url).set('X-Visitor-Id', id),
  post: (url, body) => request(app).post(url).set('X-Visitor-Id', id).send(body),
  patch: (url, body) => request(app).patch(url).set('X-Visitor-Id', id).send(body),
  del: (url) => request(app).delete(url).set('X-Visitor-Id', id),
});

describe('supuestos gastos', () => {
  it('lists them sorted by amount, most expensive first', async () => {
    await as(A).post('/api/planned', { description: 'Zapatillas', amount: 80000 });
    await as(A).post('/api/planned', { description: 'Dentista', amount: 65000, category: 'health' });
    await as(A).post('/api/planned', { description: 'Regalo', amount: 142500 });

    const { body } = await as(A).get('/api/planned');
    expect(body.data.map((p) => p.description)).toEqual(['Regalo', 'Zapatillas', 'Dentista']);
    expect(body.data[0]).toMatchObject({ category: 'other', included: true });
  });

  it('validates description and amount', async () => {
    expect((await as(A).post('/api/planned', { amount: 100 })).status).toBe(400);
    expect((await as(A).post('/api/planned', { description: 'x', amount: 0 })).status).toBe(400);
  });

  it('toggles whether it counts', async () => {
    const { body } = await as(A).post('/api/planned', { description: 'Viaje', amount: 300000 });
    const res = await as(A).patch(`/api/planned/${body.data._id}`, { included: false });
    expect(res.body.data.included).toBe(false);
  });

  it('pays one: becomes a real expense and leaves the list', async () => {
    const { body } = await as(A).post('/api/planned', { description: 'Dentista', amount: 65000, category: 'health' });
    const paid = await as(A).post(`/api/planned/${body.data._id}/pay`, { date: '2026-11-22' });
    expect(paid.status).toBe(201);
    expect(paid.body.data).toMatchObject({ description: 'Dentista', amount: 65000, category: 'health' });

    expect((await as(A).get('/api/planned')).body.count).toBe(0);
    expect((await as(A).get('/api/expenses')).body.count).toBe(1);
  });

  it('moves an expense back to planned', async () => {
    const { body } = await as(A).post('/api/expenses', { amount: 142500, category: 'other', date: '2026-11-22' });
    const moved = await as(A).post(`/api/planned/from-expense/${body.data._id}`);
    expect(moved.status).toBe(201);
    expect(moved.body.data).toMatchObject({ amount: 142500, description: 'Sin descripción' });
    expect((await as(A).get('/api/expenses')).body.count).toBe(0);
  });

  it("cannot touch another visitor's planned expenses", async () => {
    const { body } = await as(A).post('/api/planned', { description: 'Mío', amount: 100 });
    const url = `/api/planned/${body.data._id}`;
    expect((await as(B).get('/api/planned')).body.count).toBe(0);
    expect((await as(B).patch(url, { amount: 1 })).status).toBe(404);
    expect((await as(B).del(url)).status).toBe(404);
    expect((await as(B).post(`${url}/pay`, { date: '2026-11-22' })).status).toBe(404);
  });
});
