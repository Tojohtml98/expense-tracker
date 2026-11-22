import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyLinkFromHash } from './api/device.js'

// Si se abrió desde el QR de otro dispositivo, adoptar su código antes del primer pedido a la API
const justLinked = applyLinkFromHash()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App justLinked={justLinked} />
  </StrictMode>,
)
