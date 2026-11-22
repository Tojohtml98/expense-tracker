// Identificador anónimo de este navegador: la API devuelve solo los gastos de este ID,
// así cada visitante tiene su propia planilla sin crear cuenta.
// Para ver los mismos gastos en otro dispositivo, ese dispositivo adopta el mismo ID
// (escaneando el QR o pegando el código). El ID va en el #hash del link: el navegador
// no lo manda al servidor, así no queda en logs.
const VISITOR_KEY = 'expense-tracker:visitor';
const PREVIOUS_KEY = 'expense-tracker:visitor-anterior';
const HASH_PREFIX = '#vincular=';
// Copia del ID en una cookie: el iPhone (iOS 17.2+) y la Mac copian las cookies de Safari
// a la app de la pantalla de inicio / del Dock al instalarla, pero NO el localStorage.
// Sin esto, la app instalada arrancaba con un ID nuevo y se veía vacía.
const COOKIE_NAME = 'et_vid';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // 400 días: el máximo que aceptan los navegadores
// Sin anclas: acepta el código solo o el link entero ("Copiar link") pegado en el campo.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

let memoryId;
let createdNow = false;

function readCookie() {
  try {
    const pair = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
    const value = pair ? decodeURIComponent(pair.slice(COOKIE_NAME.length + 1)).toLowerCase() : '';
    return UUID_RE.test(value) ? value.match(UUID_RE)[0] : null;
  } catch {
    return null;
  }
}

function writeCookie(id) {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${id}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // Cookies bloqueadas: queda solo el localStorage
  }
}

export function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      // App recién instalada: recupera el ID de la cookie que copió Safari
      id = readCookie();
      if (!id) {
        id = crypto.randomUUID();
        createdNow = true;
      }
      localStorage.setItem(VISITOR_KEY, id);
    }
    if (readCookie() !== id) writeCookie(id);
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
    createdNow = false;
  } catch {
    memoryId = id;
  }
  writeCookie(id);
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

// true si este dispositivo arrancó de cero en esta carga (sin gastos de otro lado todavía)
export function startedFresh() {
  visitorId();
  return createdNow;
}

// true si corre como app instalada (pantalla de inicio del iPhone, Dock de la Mac, Android)
export function isInstalledApp() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  } catch {
    return false;
  }
}
