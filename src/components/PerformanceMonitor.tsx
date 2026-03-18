/**
 * 📊 性能监控面板
 * 开发模式下显示实时性能指标
 */

import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap, Clock, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  renderTime: number;
  agentCount: number;
  taskQueueLength: number;
  apiLatency: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: { used: 0, total: 0, percentage: 0 },
    renderTime: 0,
    agentCount: 0,
    taskQueueLength: 0,
    apiLatency: 0
  });
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        frameCount = 0;
        lastTime = currentTime;

        setMetrics(prev => ({ ...prev, fps }));
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // 测量内存使用 (如果浏览器支持)
    const measureMemory = () => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const total = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        const percentage = Math.round((used / total) * 100);

        setMetrics(prev => ({
          ...prev,
          memory: { used, total, percentage }
        }));
      }
    };

    const memoryInterval = setInterval(measureMemory, 2000);

    // 测量渲染时间
    const measureRenderTime = () => {
      const entries = performance.getEntriesByType('measure');
      if (entries.length > 0) {
        const latest = entries[entries.length - 1];
        setMetrics(prev => ({
          ...prev,
          renderTime: Math.round(latest.duration)
        }));
      }
    };

    const renderInterval = setInterval(measureRenderTime, 1000);

    // 模拟其他指标 (实际应该从真实数据源获取)
    const updateOtherMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        agentCount: Math.max(0, prev.agentCount + Math.floor(Math.random() * 3 - 1)),
        taskQueueLength: Math.max(0, prev.taskQueueLength + Math.floor(Math.random() * 5 - 2)),
        apiLatency: Math.max(10, prev.apiLatency + Math.floor(Math.random() * 50 - 25))
      }));
    };

    const metricsInterval = setInterval(updateOtherMetrics, 3000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(memoryInterval);
      clearInterval(renderInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  // 仅在开发模式显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-[9999] cursor-pointer"
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-green-500/30 hover:border-green-500 transition-colors">
          <Activity className="w-5 h-5 text-green-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80">
      <div className="bg-black/90 backdrop-blur-md rounded-lg border border-green-500/30 shadow-2xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">Performance Monitor</span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white/60 hover:text-white text-xs"
          >
            最小化
          </button>
        </div>

        {/* 指标面板 */}
        <div className="p-3 space-y-3">
          {/* FPS */}
          <MetricRow
            icon={<Zap className="w-4 h-4" />}
            label="FPS"
            value={metrics.fps}
            unit=""
            target={60}
            status={metrics.fps >= 55 ? 'good' : metrics.fps >= 30 ? 'warning' : 'bad'}
          />

          {/* 内存 */}
          <MetricRow
            icon={<HardDrive className="w-4 h-4" />}
            label="Memory"
            value={metrics.memory.used}
            unit="MB"
            target={metrics.memory.total}
            status={
              metrics.memory.percentage < 70
                ? 'good'
                : metrics.memory.percentage < 85
                ? 'warning'
                : 'bad'
            }
            subtitle={`${metrics.memory.percentage}% of ${metrics.memory.total}MB`}
          />

          {/* 渲染时间 */}
          <MetricRow
            icon={<Clock className="w-4 h-4" />}
            label="Render Time"
            value={metrics.renderTime}
            unit="ms"
            target={16}
            status={metrics.renderTime <= 16 ? 'good' : metrics.renderTime <= 33 ? 'warning' : 'bad'}
          />

          {/* Agent数量 */}
          <MetricRow
            icon={<Cpu className="w-4 h-4" />}
            label="Agents"
            value={metrics.agentCount}
            unit=""
            status="info"
          />

          {/* 任务队列 */}
          <MetricRow
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Task Queue"
            value={metrics.taskQueueLength}
            unit=""
            status={metrics.taskQueueLength < 10 ? 'good' : metrics.taskQueueLength < 20 ? 'warning' : 'bad'}
          />

          {/* API延迟 */}
          <MetricRow
            icon={<Activity className="w-4 h-4" />}
            label="API Latency"
            value={metrics.apiLatency}
            unit="ms"
            target={200}
            status={metrics.apiLatency <= 200 ? 'good' : metrics.apiLatency <= 500 ? 'warning' : 'bad'}
          />
        </div>

        {/* 页脚 */}
        <div className="px-3 py-2 border-t border-white/10">
          <p className="text-xs text-white/40">
            🔬 Development Mode Only
          </p>
        </div>
      </div>
    </div>
  );
}

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  target?: number;
  status?: 'good' | 'warning' | 'bad' | 'info';
  subtitle?: string;
}

function MetricRow({ icon, label, value, unit, target, status = 'info', subtitle }: MetricRowProps) {
  const statusColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    bad: 'text-red-400',
    info: 'text-blue-400'
  };

  const statusBg = {
    good: 'bg-green-500/10',
    warning: 'bg-yellow-500/10',
    bad: 'bg-red-500/10',
    info: 'bg-blue-500/10'
  };

  return (
    <div className={`flex items-center gap-3 p-2 rounded ${statusBg[status]}`}>
      <div className={statusColors[status]}>{icon}</div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-white/60">{label}</span>
          <span className={`text-sm font-mono font-semibold ${statusColors[status]}`}>
            {value}{unit}
            {target && <span className="text-white/30 text-xs ml-1">/ {target}{unit}</span>}
          </span>
        </div>
        {subtitle && <div className="text-[10px] text-white/40 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
