import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// For GitHub Pages deployment at https://hamyung1234-commits.github.io/nabi7app/
export default defineConfig({
  plugins: [react()],
  base: '/nabi7app/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
