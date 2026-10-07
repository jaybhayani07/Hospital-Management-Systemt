import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        (await import('tailwindcss')).default,
        (await import('autoprefixer')).default,
      ],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:2503',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
