import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Minimal config for debugging
export default defineConfig({
  plugins: [
    react()
  ],
  base: '/nabi7app/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    minify: false,  // Disable minification to see if that's the issue
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          xlsx: ['xlsx'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  },
  logLevel: 'info',
})