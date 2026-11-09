import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'

/**
 * Vercel production: static §8b-A migration notice (no React bundle).
 */
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'migration.html'),
    },
  },
  plugins: [
    {
      name: 'migration-index-html',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist')
        const built = path.join(distDir, 'migration.html')
        const index = path.join(distDir, 'index.html')
        if (fs.existsSync(built)) {
          fs.copyFileSync(built, index)
          fs.unlinkSync(built)
        }
      },
    },
  ],
})
