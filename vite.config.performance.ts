/**
 * Vite性能优化配置
 * 专注于Bundle体积优化
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // 性能优化：代码分割
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks: {
          // React核心
          'react-core': ['react', 'react-dom', 'react-dom/client'],

          // 路由和状态管理
          'state-management': ['zustand', 'react-router-dom'],

          // UI框架（按需拆分）
          'framer-motion': ['framer-motion'],
          'dnd': ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend'],

          // 图表库（最大的包，单独拆分）
          'recharts': ['recharts'],

          // 工具库
          'utils': ['clsx', 'date-fns', 'html2canvas'],

          // 图标库（单独拆分）
          'icons': ['lucide-react'],

          // i18n
          'i18n': ['i18next', 'react-i18next']
        },

        // 资源文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },

    // 分包大小警告阈值
    chunkSizeWarningLimit: 500 // 500KB
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'zustand',
      'framer-motion'
    ],
    exclude: [
      // 大型库延迟加载
      'recharts',
      'html2canvas'
    ]
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.IS_ELECTRON': 'false'
  }
})
