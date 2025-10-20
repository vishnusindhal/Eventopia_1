import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  server: {
    allowedHosts: ['eventopia-1-4.onrender.com'], // 👈 add your Render frontend domain
    port: 5173, // optional (safe default)
  },
})
