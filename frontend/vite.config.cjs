import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  server: {
    // ----------------------------------------------------
    // 🔥 FIX FOR LOCAL 404: ADD PROXY CONFIGURATION
    // ----------------------------------------------------
    proxy: {
      // If a request starts with /api, forward it to the backend on port 5000
      '/api': {
        target: 'http://localhost:5000', // <-- Target your backend URL here
        changeOrigin: true, // Needed for virtual hosting
        secure: false, // For local HTTP development
        // If your backend endpoints already include /api (e.g., in server.js), 
        // you do NOT need a rewrite.
      },
    },
    // The `allowedHosts` is typically not needed for localhost development,
    // but we will keep it for reference.
    allowedHosts: ['eventopia-1-8.onrender.com'], 
    port: 5173, 
    // ----------------------------------------------------
  },
})
