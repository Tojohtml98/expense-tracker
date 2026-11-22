// Identificador anónimo de este navegador: la API devuelve solo los gastos de este ID,
// así cada visitante tiene su propia planilla sin crear cuenta.
// Para ver los mismos gastos en otro dispositivo, ese dispositivo adopta el mismo ID
// (escaneando el QR o pegando el código). El ID va en el #hash del link: el navegador
// no lo manda al servidor, así no queda en logs.
const VISITOR_KEY = 'expense-tracker:visitor';
const PREVIOUS_KEY = 'expense-tracker:visitor-anterior';
const HASH_PREFIX = '#vincular=';
// Sin anclas: acepta el código solo o el link entero ("Copiar link") pegado en el campo.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

let memoryId;

export function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    // Modo privado / storage bloqueado: dura lo que dure la pestaña
    memoryId ??= crypto.randomUUID();
    return memoryId;
  }
}

export function linkDevice(code) {
  const match = decodeURIComponent(String(code ?? '')).toLowerCase().match(UUID_RE);
  if (!match) return false;
  const id = match[0];
  const current = visitorId();
  if (id === current) return true;
  try {
    // El ID anterior se guarda por si hay que volver: sus gastos siguen en la base.
    localStorage.setItem(PREVIOUS_KEY, current);
    localStorage.setItem(VISITOR_KEY, id);
  } catch {
    memoryId = id;
  }
  return true;
}

export function applyLinkFromHash() {
  const { hash, pathname, search } = window.location;
  if (!hash.startsWith(HASH_PREFIX)) return false;
  const ok = linkDevice(hash.slice(HASH_PREFIX.length));
  window.history.replaceState(null, '', pathname + search);
  return ok;
}

export function linkUrl() {
  return `${window.location.origin}/${HASH_PREFIX}${visitorId()}`;
}
