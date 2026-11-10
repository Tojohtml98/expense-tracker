import { AppError } from './errorHandler.js';

// Cada navegador genera un UUID al azar (crypto.randomUUID) y lo manda en este header.
// Funciona como una llave anónima: 122 bits de azar, imposible de adivinar, así que
// cada visitante ve y modifica solo sus propios gastos sin necesidad de crear cuenta.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requireVisitor(req, res, next) {
  const id = req.get('x-visitor-id');
  if (!id || !UUID.test(id)) {
    return next(new AppError('Missing or invalid X-Visitor-Id header', 400));
  }
  req.visitorId = id.toLowerCase();
  next();
}
