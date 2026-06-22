import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env files so we can read VITE_API_URL at config time.
  // This resolves from the frontend/ directory (process.cwd()).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    resolve: {
      extensions: ['.js', '.jsx'],
    },

    server: {
      port: 5173,

      // Development proxy: forwards /api/* requests to the local backend,
      // avoiding CORS pre-flight issues during development.
      // This is ONLY active during `npm run dev` (local dev).
      proxy: {
        '/api': {
          target: env.VITE_API_URL
            ? env.VITE_API_URL.replace('/api', '')   // strip trailing /api
            : 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
