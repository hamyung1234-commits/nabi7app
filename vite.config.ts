import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Base path: GitHub Pages repository name
// Use VITE_BASE_URL env var to override for other hosting
const base = process.env.VITE_BASE_URL || '/nabi-assistant/';

export default defineConfig({
  plugins: [react()],
  base: base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})