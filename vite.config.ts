import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Base path configuration:
// - Default: "/" for Vercel/Netlify/Render
// - Use VITE_BASE_URL env var for GitHub Pages subdirectory
const base = process.env.VITE_BASE_URL || '/';

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