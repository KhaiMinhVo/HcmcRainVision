import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const CONFIG_URL = (import.meta.env.BASE_URL || '/') + 'config.json'
const CONFIG_TIMEOUT_MS = 3000

function loadRuntimeConfig(): Promise<void> {
  return new Promise((resolve) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), CONFIG_TIMEOUT_MS)
    fetch(CONFIG_URL, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { apiBaseUrl?: string }) => {
        if (data?.apiBaseUrl && typeof data.apiBaseUrl === 'string') {
          window.__API_BASE_URL__ = data.apiBaseUrl.replace(/\/$/, '')
        }
      })
      .catch(() => { /* dùng URL mặc định từ build */ })
      .finally(() => {
        clearTimeout(id)
        resolve()
      })
  })
}

// Chi load config.json trong production (GitHub Pages).
// Khi dev local (npm run dev), PROD = false → dung VITE_API_BASE_URL tu .env.local
const startup = import.meta.env.PROD ? loadRuntimeConfig() : Promise.resolve()
startup.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
