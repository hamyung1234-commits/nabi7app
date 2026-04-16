import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Base path: / for clean root URLs on GitHub Pages
const base = '/'

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
    open: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Disable minification to reduce memory usage
    minify: false,
    // Disable CSS code splitting
    cssCodeSplit: false,
    // Use legacy mode for broader compatibility
    target: 'es2015',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Disable tree shaking for debugging
    treeshake: false,
  },
})