# BI System 快速开始指南

## 5分钟快速上手

### 1. 导入BI组件

```typescript
// 在你的React应用中导入
import { BiDashboard } from '@/components/bi';
```

### 2. 创建第一个仪表盘

```typescript
import React from 'react';
import { BiDashboard } from '@/components/bi';

function MyFirstDashboard() {
  return (
    <div className="h-screen">
      <BiDashboard
        editable={true}
        onSave={(dashboard) => {
          console.log('Dashboard saved!', dashboard);
        }}
      />
    </div>
  );
}

export default MyFirstDashboard;
```

### 3. 使用预设模板

```typescript
import { BiDashboard } from '@/components/bi';
import biDataService from '@/services/bi/biDataService';
import { getTemplate } from '@/services/bi/biTemplates';

async function createDashboardFromTemplate() {
  // 获取Executive模板
  const template = getTemplate('executive');

  // 创建仪表盘
  const dashboard = await biDataService.createDashboard({
    name: template.name,
    description: template.description,
    layout: template.layout,
    widgets: template.widgets,
    filters: {},
    refresh: 60
  });

  return dashboard.id;
}

function TemplateDashboard() {
  const [dashboardId, setDashboardId] = React.useState(null);

  React.useEffect(() => {
    createDashboardFromTemplate().then(setDashboardId);
  }, []);

  if (!dashboardId) return <div>Loading...</div>;

  return <BiDashboard dashboardId={dashboardId} />;
}
```

### 4. 添加自定义Widget

```typescript
import { BiWidget } from '@/components/bi';

function CustomDashboard() {
  const widget = {
    id: 'my-widget',
    type: 'line',
    title: 'Sales Trend',
    dataSource: 'sales',
    query: {
      dimensions: ['date'],
      metrics: ['amount']
    },
    config: {
      showTrend: true,
      movingAverage: 7
    },
    position: { x: 0, y: 0 },
    size: { w: 6, h: 4 }
  };

  return (
    <BiWidget
      widget={widget}
      editable={true}
      onUpdate={(updates) => {
        console.log('Widget updated:', updates);
      }}
    />
  );
}
```

### 5. 执行数据查询

```typescript
import { BiEngine } from '@/services/bi';

const engine = new BiEngine();

// 准备数据
const data = [
  { date: '2024-01-01', category: 'A', value: 100 },
  { date: '2024-01-02', category: 'B', value: 150 },
  // ... more data
];

// 查询
const result = engine.query(data, {
  dimensions: ['category'],
  metrics: ['value'],
  filters: { value: { min: 100 } },
  orderBy: { field: 'value', direction: 'desc' }
});

console.log('Query result:', result);
```

### 6. 实时数据流

```typescript
import biDataService from '@/services/bi/biDataService';

function RealtimeDashboard() {
  const [metrics, setMetrics] = React.useState({});

  React.useEffect(() => {
    // 连接实时流
    biDataService.connectRealtimeStream(
      'my-stream',
      'ws://localhost:3000/realtime',
      (data) => {
        setMetrics(data);
      }
    );

    // 清理
    return () => {
      biDataService.disconnectRealtimeStream('my-stream');
    };
  }, []);

  return (
    <div>
      <h1>CPU: {metrics.cpu}%</h1>
      <h1>Memory: {metrics.memory}%</h1>
    </div>
  );
}
```

### 7. 导出数据

```typescript
import biDataService from '@/services/bi/biDataService';

async function exportData(data) {
  // 导出为CSV
  const csvBlob = await biDataService.exportData('csv', data);

  // 下载
  const url = URL.createObjectURL(csvBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  a.click();
  URL.revokeObjectURL(url);
}
```

## 常用模板

### Executive Dashboard
```typescript
const template = getTemplate('executive');
// 包含：Revenue, Users, Conversion, Satisfaction KPIs
```

### Analytics Dashboard
```typescript
const template = getTemplate('analytics');
// 包含：Traffic, Sources, Heatmap, Engagement
```

### Sales Dashboard
```typescript
const template = getTemplate('sales');
// 包含：Sales, Deals, Win Rate, Forecast
```

## 所有图表类型

```typescript
const chartTypes = [
  'line',      // 折线图
  'bar',       // 条形图
  'column',    // 柱状图
  'pie',       // 饼图
  'area',      // 面积图
  'scatter',   // 散点图
  'heatmap',   // 热力图
  'radar',     // 雷达图
  'gauge',     // 仪表盘
  'kpi',       // KPI卡片
  // ... 更多
];
```

## 数据分析示例

```typescript
import { BiEngine } from '@/services/bi';

const engine = new BiEngine();

// 1. 同比增长
const withYoY = engine.calculateGrowth(data, 'sales', 'date', 'yoy');

// 2. 移动平均
const withMA = engine.movingAverage(data, 'sales', 7);

// 3. 排名
const ranked = engine.rank(data, 'sales', true);

// 4. 异常检测
const anomalies = engine.detectAnomalies(data, 'sales', 2);

// 5. 透视表
const pivot = engine.pivot(
  data,
  ['region'],      // 行
  ['product'],     // 列
  'sales',        // 值
  'sum'           // 聚合
);
```

## 需要帮助？

查看完整文档：
- `BI_SYSTEM_DOCUMENTATION.md` - 完整系统文档
- `TASK_308_COMPLETION_REPORT.md` - 详细功能报告

或查看代码注释，所有文件都有详细的注释说明。

---

**Happy Building! 🚀**
