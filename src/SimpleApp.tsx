/**
 * 超级简化的App组件 - 用于Web版调试
 */
import React from 'react'

export default function SimpleApp() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '60px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
          maxWidth: '600px'
        }}
      >
        <h1 style={{
          fontSize: '48px',
          color: '#667eea',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          🎉 AgentForge Web 版
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#666',
          marginBottom: '30px'
        }}>
          React 渲染成功！
        </p>
        <div style={{
          background: '#f0f0f0',
          padding: '20px',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#333',
          textAlign: 'left'
        }}>
          <p><strong>✅ 环境检测：</strong></p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>React 版本: {React.version}</li>
            <li>浏览器: {navigator.userAgent.split(')')[0].split('(')[1]}</li>
            <li>时间: {new Date().toLocaleString('zh-CN')}</li>
          </ul>
        </div>
        <button
          onClick={() => alert('按钮点击成功！事件处理正常。')}
          style={{
            marginTop: '30px',
            padding: '15px 40px',
            fontSize: '18px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          测试交互
        </button>
      </div>
    </div>
  )
}
