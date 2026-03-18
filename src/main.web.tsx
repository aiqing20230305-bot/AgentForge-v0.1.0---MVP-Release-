/**
 * Web版入口文件（简化版，避免Electron依赖）
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/animations.css'
import './styles/macos-glass.css'
import './styles/cockpit-animation.css'
import './styles/instant-feedback.css'
import './styles/mobile.css'

console.log('✅ main.web.tsx loaded')

// 确保在浏览器环境
if (typeof window === 'undefined') {
  throw new Error('This build is for browser only')
}

// 禁用所有Electron API调用
(window as any).electron = undefined;
console.log('✅ Electron APIs disabled')

// 渲染应用
try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  console.log('✅ Root element found')

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('✅ React app rendered')
} catch (error) {
  console.error('❌ Failed to render app:', error)
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #ef4444;">启动失败 / Startup Failed</h1>
      <pre style="background: #1f2937; color: #10b981; padding: 20px; border-radius: 8px; text-align: left; overflow-x: auto;">
${error}
      </pre>
      <p>请打开开发者工具查看详细错误 / Please open DevTools for details</p>
    </div>
  `
}
