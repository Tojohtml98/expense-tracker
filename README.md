# Expense Tracker

API REST + SPA para registrar gastos mensuales, con resumen por categoría.

## Stack

- **Backend:** Node.js + Express 5 + MongoDB (Mongoose 9)
- **Frontend:** React + Vite, `fetch` nativo (sin librerías de UI)
- **Testing:** Jest + Supertest + mongodb-memory-server
- **Docker:** Dockerfile por servicio + `docker-compose.yml` (mongo + api + client)

## Funcionalidades

- Alta, edición y baja de gastos (monto, categoría, descripción, fecha)
- Listado del mes actual con filtro por categoría
- Resumen: total del mes + total por categoría
- **Cada visitante ve solo sus gastos, sin crear cuenta:** el navegador genera un UUID al azar
  (`crypto.randomUUID`), lo guarda en `localStorage` y lo manda en el header `X-Visitor-Id`.
  La API filtra toda consulta por ese ID e ignora cualquier `owner` que venga en el body.

## Deploy

- **Cliente:** Vercel (root `client/`, preset Vite).
- **API:** Vercel serverless (root `server/`): `api/index.js` envuelve la misma app de Express
  y reusa la conexión a Mongo entre invocaciones. Variable requerida: `MONGO_URI`.

## Correr en local (sin Docker)

```bash
docker compose up -d mongo   # solo la base
cd server && npm install && cp .env.example .env && npm run dev
cd client && npm install && cp .env.example .env && npm run dev
```

## Correr todo con Docker

```bash
docker compose up -d --build
```

- Cliente: http://localhost:5173
- API: http://localhost:4000/api
- Health check: http://localhost:4000/health

## Tests

```bash
cd server && npm test     # 8 tests: CRUD, resumen y aislamiento entre visitantes
cd client && npx vitest   # 4 tests del formulario
```
