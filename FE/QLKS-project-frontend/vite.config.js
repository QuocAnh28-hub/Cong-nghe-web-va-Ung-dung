import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-khachdat': {
        target: 'https://localhost:7297',
        changeOrigin: true,
        secure: false,
      },
      '/api-common': {
        target: 'https://localhost:7297',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
