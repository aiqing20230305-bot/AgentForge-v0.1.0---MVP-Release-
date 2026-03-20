import React from 'react';

/**
 * 自定义报表组件
 * v2.2.0 - 拖拽式报表构建器
 */
export function CustomReports() {
  return (
    <div className="custom-reports">
      <h2>📝 自定义报表</h2>
      
      <div className="report-builder">
        <div className="builder-sidebar">
          <h3>可用组件</h3>
          <div className="component-list">
            <div className="draggable-component">📊 折线图</div>
            <div className="draggable-component">📈 柱状图</div>
            <div className="draggable-component">🥧 饼图</div>
            <div className="draggable-component">📋 表格</div>
          </div>
        </div>

        <div className="builder-canvas">
          <p>拖拽组件到此处构建报表</p>
          {/* TODO v2.6.0: 实现React DnD (Phase 4.1) */}
        </div>
      </div>

      <div className="report-templates">
        <h3>预置模板</h3>
        <div className="template-grid">
          <div className="template-card">日报模板</div>
          <div className="template-card">周报模板</div>
          <div className="template-card">月报模板</div>
        </div>
      </div>
    </div>
  );
}
