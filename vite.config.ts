import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // In dev, proxy /api to the live server to load all 500+ garbas and library songs
    proxy: {
      '/api': {
        target: 'https://garbaraas.in',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

