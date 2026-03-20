/**
 * 最小化App - 逐步恢复功能
 */
import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import TopBar from './components/TopBar'
import AgentDisplayPanel from './components/AgentDisplayPanel'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

export default function MinimalApp() {
  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
          {/* 调试信息 */}
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 212, 255, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            zIndex: 9999,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ✅ MinimalApp 已加载
          </div>

          {/* TopBar */}
          <div style={{ position: 'relative', zIndex: 100 }}>
            <TopBar />
          </div>

          {/* 主内容区域 */}
          <div className="flex-1 flex min-h-0 mt-12" style={{ position: 'relative', zIndex: 10 }}>
            <div className="flex-1 min-w-0 overflow-hidden h-full">
              <AgentDisplayPanel />
            </div>
          </div>
        </div>
      </DndProvider>
    </ErrorBoundary>
  )
}
