import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/animations.css'
import './styles/macos-glass.css'
import './styles/cockpit-animation.css'
import './styles/instant-feedback.css'
import './styles/mobile.css'

// i18n国际化
import './i18n/config'

// Web版特性检测
const isElectron = typeof window !== 'undefined' && (window as any).electron
const isWeb = !isElectron

// Web版性能监控
if (isWeb && import.meta.env.PROD) {
  import('./utils/webPerformance').then(({ getPerformanceMonitor }) => {
    const monitor = getPerformanceMonitor()
    monitor.start()
  })
}

// Web版: 使用WebApp组件包装
const AppComponent = isWeb ?
  React.lazy(() => import('./components/WebApp').then(module => ({ default: module.WebApp }))) :
  App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isWeb ? (
      <React.Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
            <div className="mt-4 text-white text-lg">Loading AgentForge...</div>
          </div>
        </div>
      }>
        <AppComponent />
      </React.Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>
)
