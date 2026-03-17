import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'electron-store']
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron'
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心依赖
          'react-vendor': ['react', 'react-dom'],
          // UI 库
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // 工具库
          'utils-vendor': ['axios', 'date-fns', 'zustand'],
          // 图表库
          'charts-vendor': ['recharts'],
          // 国际化
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector']
        },
        // 文件名模式
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          } else if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          } else if (extType === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    },
    // 块大小警告限制
    chunkSizeWarningLimit: 1000,
    // 生成 source map
    sourcemap: false,
    // 资源内联限制
    assetsInlineLimit: 4096
  },
  // 性能优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      'axios',
      'zustand',
      'recharts'
    ]
  },
  // 服务器配置
  server: {
    // 预加载关键资源
    preTransformRequests: true
  }
})
