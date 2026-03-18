import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

/**
 * 实时监控Dashboard组件
 * v2.2.0 - 企业级数据分析（ECharts集成）
 */

interface MetricData {
  timestamp: number;
  value: number;
}

export function RealtimeDashboard() {
  const [performanceData, setPerformanceData] = useState<MetricData[]>([]);
  const [cpuData, setCpuData] = useState<MetricData[]>([]);

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPerformanceData(prev => [
        ...prev.slice(-20),
        { timestamp: now, value: 90 + Math.random() * 10 }
      ]);
      setCpuData(prev => [
        ...prev.slice(-20),
        { timestamp: now, value: 40 + Math.random() * 20 }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ECharts配置 - 性能趋势折线图
  const performanceChartOption = {
    title: {
      text: 'Agent Success Rate',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        return `Success Rate: ${point.value.toFixed(2)}%`;
      }
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      data: performanceData.map(d => [d.timestamp, d.value]),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: 'rgba(99, 102, 241, 0.2)'
      },
      lineStyle: {
        color: '#6366f1',
        width: 2
      },
      itemStyle: {
        color: '#6366f1'
      }
    }]
  };

  // ECharts配置 - CPU使用率
  const cpuChartOption = {
    title: {
      text: 'CPU Usage',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        return `CPU: ${point.value.toFixed(1)}%`;
      }
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      data: cpuData.map(d => [d.timestamp, d.value]),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: 'rgba(34, 197, 94, 0.2)'
      },
      lineStyle: {
        color: '#22c55e',
        width: 2
      },
      itemStyle: {
        color: '#22c55e'
      }
    }]
  };

  // 响应时间分布饼图
  const responseTimeOption = {
    title: {
      text: 'Response Time Distribution',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}ms ({d}%)'
    },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 450, name: '<100ms' },
        { value: 320, name: '100-200ms' },
        { value: 180, name: '200-500ms' },
        { value: 50, name: '>500ms' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <div className="realtime-dashboard" style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>📊 实时监控</h2>
      
      {/* 关键指标卡片 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '30px'
      }}>
        <MetricCard 
          title="Success Rate" 
          value="98.5%" 
          trend="+2.3%"
          color="#22c55e"
        />
        <MetricCard 
          title="CPU Usage" 
          value="45%" 
          trend="-5%"
          color="#6366f1"
        />
        <MetricCard 
          title="Avg Response" 
          value="120ms" 
          trend="-12ms"
          color="#f59e0b"
        />
        <MetricCard 
          title="Active Users" 
          value="1,234" 
          trend="+156"
          color="#ec4899"
        />
      </div>

      {/* ECharts图表 */}
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
          <ReactECharts option={performanceChartOption} style={{ height: '300px' }} />
        </div>

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <ReactECharts option={cpuChartOption} style={{ height: '300px' }} />
        </div>

        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <ReactECharts option={responseTimeOption} style={{ height: '300px' }} />
        </div>
      </div>
    </div>
  );
}

// 指标卡片组件
function MetricCard({ 
  title, 
  value, 
  trend, 
  color 
}: { 
  title: string; 
  value: string; 
  trend: string;
  color: string;
}) {
  const isPositive = trend.startsWith('+');
  
  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '12px', 
        color: isPositive ? '#22c55e' : '#ef4444' 
      }}>
        {trend}
      </div>
    </div>
  );
}
