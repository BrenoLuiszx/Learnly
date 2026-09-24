import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

// Restore persisted appearance settings
;(() => {
  const accent = localStorage.getItem('accentColor')
  if (accent) {
    document.documentElement.style.setProperty('--accent', accent)
    const r = parseInt(accent.slice(1,3),16)
    const g = parseInt(accent.slice(3,5),16)
    const b = parseInt(accent.slice(5,7),16)
    document.documentElement.style.setProperty('--accent-rgb', `${r},${g},${b}`)
  }
  const fontSize = localStorage.getItem('fontSize')
  const sizeMap = { 'Pequeno': '14px', 'Médio': '16px', 'Grande': '18px' }
  if (fontSize && sizeMap[fontSize]) document.documentElement.style.fontSize = sizeMap[fontSize]
  if (localStorage.getItem('reducedMotion') === 'true') document.documentElement.classList.add('reduced-motion')
  if (localStorage.getItem('highContrast') === 'true') document.documentElement.classList.add('high-contrast')
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
