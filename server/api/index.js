// Entrada serverless para Vercel: misma app de Express que server.js usa en local/Docker.
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

export default async function handler(req, res) {
  if (req.url !== '/health' && req.url !== '/') {
    try {
      await connectDB(process.env.MONGO_URI);
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      return res.status(503).json({ success: false, message: 'Database unavailable, try again shortly' });
    }
  }
  return app(req, res);
}
