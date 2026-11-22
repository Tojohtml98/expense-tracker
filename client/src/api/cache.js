import { visitorId } from './device.js';

// Copia local de la última respuesta de la API: la app pinta al instante con lo último
// que vio y actualiza por detrás (la API en el plan gratis puede tardar en despertar).
// Va separada por visitante, así vincular otro dispositivo no mezcla datos.
const PREFIX = 'expense-tracker:cache:';
const key = (name) => `${PREFIX}${visitorId()}:${name}`;

export function readCache(name) {
  try {
    const raw = localStorage.getItem(key(name));
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function writeCache(name, value) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // Storage lleno o bloqueado: seguimos sin copia local
  }
}
