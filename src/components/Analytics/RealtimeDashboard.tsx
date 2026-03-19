import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useTaskStore } from '../../stores/taskStore';
import { useBuildStore } from '../../stores/buildStore';

/**
 * 实时监控Dashboard组件
 * v2.2.0 - 企业级数据分析 - ECharts集成完成
 */
export function RealtimeDashboard() {
  const { tasks, getTaskStats } = useTaskStore();
  const { inventoryItems } = useBuildStore();
  const [metrics, setMetrics] = useState({
    successRate: 0,
    cpuUsage: 0,
    avgResponseTime: 0,
    activeAgents: 0
  });

  // 计算实时指标
  useEffect(() => {
    const stats = getTaskStats();
    const agents = inventoryItems.filter(item => item.category === 'agents');

    setMetrics({
      successRate: stats.total > 0 ? (stats.completed / stats.total * 100) : 0,
      cpuUsage: Math.random() * 60 + 30, // 模拟CPU使用率
      avgResponseTime: Math.random() * 100 + 80,
      activeAgents: agents.length
    });

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.random() * 60 + 30,
        avgResponseTime: Math.random() * 100 + 80
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [tasks, inventoryItems, getTaskStats]);

  return (
    <div className="realtime-dashboard p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        📊 实时监控
      </h2>

      {/* 指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Agent Performance"
          value={`${metrics.successRate.toFixed(1)}%`}
          label="Success Rate"
          trend="up"
        />
        <MetricCard
          title="Resource Usage"
          value={`${metrics.cpuUsage.toFixed(0)}%`}
          label="CPU"
          trend="stable"
        />
        <MetricCard
          title="Response Time"
          value={`${metrics.avgResponseTime.toFixed(0)}ms`}
          label="Average"
          trend="down"
        />
        <MetricCard
          title="Active Agents"
          value={metrics.activeAgents.toString()}
          label="Online"
          trend="up"
        />
      </div>

      {/* ECharts 实时图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskTrendChart />
        <ResourceUsageChart cpuUsage={metrics.cpuUsage} />
      </div>
    </div>
  );
}

/**
 * 指标卡片组件
 */
function MetricCard({ title, value, label, trend }: {
  title: string;
  value: string;
  label: string;
  trend: 'up' | 'down' | 'stable';
}) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-yellow-400'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
      <h3 className="text-sm font-medium text-white/70 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{label}</span>
        <span className={`text-sm ${trendColors[trend]}`}>{trendIcons[trend]}</span>
      </div>
    </div>
  );
}

/**
 * 任务趋势图表
 */
function TaskTrendChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { tasks } = useTaskStore();

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    // 生成过去7天的数据
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    });

    // 模拟任务数据
    const completed = Array.from({ length: 7 }, () => Math.floor(Math.random() * 20 + 10));
    const failed = Array.from({ length: 7 }, () => Math.floor(Math.random() * 5));

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['Completed', 'Failed'],
        textStyle: { color: '#fff' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
        axisLabel: { color: '#fff' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.2)' } },
        axisLabel: { color: '#fff' },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
      },
      series: [
        {
          name: 'Completed',
          type: 'line',
          smooth: true,
          data: completed,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ])
          },
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 2 }
        },
        {
          name: 'Failed',
          type: 'line',
          smooth: true,
          data: failed,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239, 68, 68, 0.5)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
            ])
          },
          itemStyle: { color: '#ef4444' },
          lineStyle: { width: 2 }
        }
      ]
    };

    chart.setOption(option);

    // 响应式
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [tasks]);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">📈 Task Trends</h3>
      <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
    </div>
  );
}

/**
 * 资源使用图表
 */
function ResourceUsageChart({ cpuUsage }: { cpuUsage: number }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'gauge',
          progress: {
            show: true,
            width: 18
          },
          axisLine: {
            lineStyle: {
              width: 18,
              color: [
                [0.3, '#10b981'],
                [0.7, '#f59e0b'],
                [1, '#ef4444']
              ]
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: '#fff'
            }
          },
          axisLabel: {
            distance: 25,
            color: '#fff',
            fontSize: 12
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10
            }
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            fontSize: 40,
            offsetCenter: [0, '70%'],
            color: '#fff',
            formatter: '{value}%'
          },
          data: [
            {
              value: cpuUsage
            }
          ]
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [cpuUsage]);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">⚙️ Resource Monitor</h3>
      <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
    </div>
  );
}
