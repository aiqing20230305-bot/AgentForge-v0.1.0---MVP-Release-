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

// 确保在浏览器环境
if (typeof window === 'undefined') {
  throw new Error('This build is for browser only')
}

// 禁用所有Electron API调用
(window as any).electron = undefined;

// 渲染应用
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
