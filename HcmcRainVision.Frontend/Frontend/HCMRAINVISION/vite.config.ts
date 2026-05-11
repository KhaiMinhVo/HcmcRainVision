import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

const REPO_NAME = 'HcmcRainVision.Frontend'

/**
 * Get base path for GitHub Pages deployment.
 * In development use '/' so app works at localhost:5173 and at localhost:5173/HcmcRainVision.Frontend/ (via rewrite).
 */
function getBasePath(): string {
  if (process.env.NODE_ENV === 'development') return '/'
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    if (repoName?.includes('.github.io')) return '/'
    return `/${repoName}/`
  }
  return `/${REPO_NAME}/`
}

/** Dev server: rewrite /HcmcRainVision.Frontend/ to / so that URL does not 404 */
function repoBaseFallbackPlugin() {
  const basePath = `/${REPO_NAME}`
  return {
    name: 'repo-base-fallback',
    configureServer(server: { middlewares: { use: (fn: (req: import('http').IncomingMessage, res: import('http').ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? ''
        if (url === basePath || url.startsWith(basePath + '/') || url.startsWith(basePath + '?')) {
          req.url = url.slice(basePath.length) || '/'
        }
        next()
      })
    },
  }
}

/** Copy index.html to 404.html so GitHub Pages serves the SPA for any path (fix 404 on direct open/refresh) */
function copyIndexTo404Plugin() {
  return {
    name: 'copy-index-to-404',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      const indexPath = path.join(outDir, 'index.html')
      const notFoundPath = path.join(outDir, '404.html')
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [repoBaseFallbackPlugin(), react(), tailwindcss(), copyIndexTo404Plugin()],
  base: getBasePath(),
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'map-vendor': ['leaflet'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
})
