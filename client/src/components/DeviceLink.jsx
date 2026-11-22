import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { isInstalledApp, linkDevice, linkUrl, startedFresh, visitorId } from '../api/device.js';

export function DeviceLink({ onLinked, justLinked }) {
  // App instalada que arrancó vacía: abre el panel solo para pegar el link de la PC
  const [open, setOpen] = useState(() => !justLinked && isInstalledApp() && startedFresh());
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(
    justLinked ? 'Listo: este dispositivo ya usa los mismos gastos.' : '',
  );
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(linkUrl(), { margin: 1, width: 360, color: { dark: '#1b2a24', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [open, message]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(linkUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('No se pudo copiar. Copiá el código de abajo a mano.');
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!linkDevice(code)) {
      setError('Ese código no es válido. Tiene que ser como el de abajo, con guiones.');
      return;
    }
    setCode('');
    setMessage('Listo: este dispositivo ya usa los mismos gastos.');
    onLinked();
  };

  return (
    <section className="device-link">
      <button
        type="button"
        className="device-link-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Usar en otro dispositivo</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>

      {message && <p className="device-link-ok">{message}</p>}

      {open && (
        <div className="device-link-body">
          <div className="device-link-qr">
            {qr && <img src={qr} alt="Código QR para abrir tus gastos en otro dispositivo" />}
            <p>Escanealo con la cámara del celu y se abren tus mismos gastos.</p>
            <button type="button" onClick={copyLink}>{copied ? 'Copiado ✓' : 'Copiar link'}</button>
          </div>

          <form className="device-link-form" onSubmit={submit}>
            <p className="device-link-label">Tu código</p>
            <code className="device-link-code">{visitorId()}</code>

            <label>
              ¿Tenés el código o el link de otro dispositivo? Pegalo acá
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                autoComplete="off"
                spellCheck="false"
              />
            </label>
            <button type="submit" disabled={!code.trim()}>Vincular</button>
            {error && <p className="device-link-error">{error}</p>}
            <p className="device-link-note">
              Quien tenga este código ve tus gastos: no lo compartas.
            </p>
          </form>
        </div>
      )}
    </section>
  );
}
