import { beforeEach, describe, expect, it } from 'vitest';
import { applyLinkFromHash, linkDevice, linkUrl, visitorId } from './device.js';

const OTRO = '3f2b8c1e-9a4d-4e7f-b6c2-1d5e8f0a7b93';

beforeEach(() => {
  localStorage.clear();
  document.cookie = 'et_vid=; Max-Age=0; Path=/';
  window.history.replaceState(null, '', '/');
});

describe('visitorId', () => {
  it('crea un ID una sola vez y lo reutiliza', () => {
    const id = visitorId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(visitorId()).toBe(id);
  });
});

describe('linkDevice', () => {
  it('adopta el código de otro dispositivo y guarda el anterior', () => {
    const viejo = visitorId();
    expect(linkDevice(`  ${OTRO.toUpperCase()} `)).toBe(true);
    expect(visitorId()).toBe(OTRO);
    expect(localStorage.getItem('expense-tracker:visitor-anterior')).toBe(viejo);
  });

  it('acepta el link entero pegado en el campo (botón "Copiar link")', () => {
    expect(linkDevice(`https://expense-tracker-fawn-ten-40.vercel.app/#vincular=${OTRO}`)).toBe(true);
    expect(visitorId()).toBe(OTRO);
  });

  it('rechaza un código inválido sin tocar el actual', () => {
    const actual = visitorId();
    expect(linkDevice('cualquier-cosa')).toBe(false);
    expect(visitorId()).toBe(actual);
  });
});

describe('applyLinkFromHash', () => {
  it('vincula desde #vincular= y limpia la URL', () => {
    window.history.replaceState(null, '', `/#vincular=${OTRO}`);
    expect(applyLinkFromHash()).toBe(true);
    expect(visitorId()).toBe(OTRO);
    expect(window.location.hash).toBe('');
  });

  it('no hace nada sin hash', () => {
    expect(applyLinkFromHash()).toBe(false);
  });
});

describe('linkUrl', () => {
  it('arma el link con el código en el hash (no viaja al servidor)', () => {
    const id = visitorId();
    expect(linkUrl()).toBe(`${window.location.origin}/#vincular=${id}`);
  });
});

describe('cookie para la app instalada (iPhone / Mac)', () => {
  it('guarda el ID también en una cookie', () => {
    const id = visitorId();
    expect(document.cookie).toContain(`et_vid=${id}`);
  });

  it('la app recién instalada (localStorage vacío) recupera el ID de la cookie copiada por Safari', () => {
    document.cookie = `et_vid=${OTRO}; Path=/`;
    expect(visitorId()).toBe(OTRO);
    expect(localStorage.getItem('expense-tracker:visitor')).toBe(OTRO);
  });

  it('al vincular, la cookie pasa al código nuevo', () => {
    visitorId();
    linkDevice(OTRO);
    expect(document.cookie).toContain(`et_vid=${OTRO}`);
  });

  it('ignora una cookie que no es un código válido', () => {
    document.cookie = 'et_vid=basura; Path=/';
    expect(visitorId()).not.toBe('basura');
    expect(visitorId()).toMatch(/^[0-9a-f-]{36}$/);
  });
});
