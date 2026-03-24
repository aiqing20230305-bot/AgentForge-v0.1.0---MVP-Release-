import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Main Vite configuration
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
