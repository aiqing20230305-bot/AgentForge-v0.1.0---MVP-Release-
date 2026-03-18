import React from 'react';
import ReactECharts from 'echarts-for-react';

/**
 * 深度分析组件  
 * v2.2.0 - 用户行为分析、漏斗分析（ECharts集成）
 */
export function DeepAnalysis() {
  // 用户行为漏斗图
  const funnelOption = {
    title: {
      text: 'User Conversion Funnel',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [{
      type: 'funnel',
      left: '10%',
      width: '80%',
      label: {
        formatter: '{b}: {c}'
      },
      data: [
        { value: 10000, name: 'Visits' },
        { value: 8000, name: 'Sign Up' },
        { value: 6000, name: 'Create Agent' },
        { value: 4000, name: 'Deploy' },
        { value: 2500, name: 'Active Users' }
      ]
    }]
  };

  // 用户留存分析
  const retentionOption = {
    title: {
      text: 'User Retention Rate',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: ['Day 1', 'Day 3', 'Day 7', 'Day 14', 'Day 30']
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      data: [100, 85, 72, 65, 58],
      type: 'bar',
      itemStyle: {
        color: '#6366f1'
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%'
      }
    }]
  };

  // 用户活跃度热力图
  const heatmapOption = {
    title: {
      text: 'User Activity Heatmap',
      left: 'center'
    },
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: ['0-6', '6-12', '12-18', '18-24'],
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 1000,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      type: 'heatmap',
      data: [
        [0, 0, 150], [0, 1, 450], [0, 2, 800], [0, 3, 650],
        [1, 0, 200], [1, 1, 500], [1, 2, 850], [1, 3, 700],
        [2, 0, 180], [2, 1, 480], [2, 2, 820], [2, 3, 680],
        [3, 0, 220], [3, 1, 550], [3, 2, 900], [3, 3, 750],
        [4, 0, 210], [4, 1, 520], [4, 2, 870], [4, 3, 720],
        [5, 0, 100], [5, 1, 350], [5, 2, 600], [5, 3, 450],
        [6, 0, 80], [6, 1, 300], [6, 2, 550], [6, 3, 400]
      ],
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div className="deep-analysis" style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>🔍 深度分析</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <ReactECharts option={funnelOption} style={{ height: '400px' }} />
        </div>

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <ReactECharts option={retentionOption} style={{ height: '400px' }} />
        </div>

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          gridColumn: '1 / -1'
        }}>
          <ReactECharts option={heatmapOption} style={{ height: '400px' }} />
        </div>
      </div>

      {/* 分析洞察 */}
      <div style={{ 
        marginTop: '20px',
        padding: '20px',
        background: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginBottom: '10px' }}>📈 Key Insights</h3>
        <ul style={{ marginLeft: '20px' }}>
          <li>Conversion rate from signup to active user: 25%</li>
          <li>Day 7 retention rate: 72% (above industry average of 65%)</li>
          <li>Peak activity: Weekdays 12-18 (午间最活跃)</li>
          <li>Churn risk: Users who don't deploy within 3 days</li>
        </ul>
      </div>
    </div>
  );
}
