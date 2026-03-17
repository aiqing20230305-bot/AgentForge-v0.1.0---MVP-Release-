/**
 * 部署管理面板
 * 模型部署、版本管理、灰度发布
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  Activity,
  GitBranch,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import {
  deploymentManager,
  ModelDeployment,
  CanaryDeployment,
} from '../../services/training';

export const DeploymentPanel: React.FC = () => {
  const [deployments, setDeployments] = useState<ModelDeployment[]>([]);
  const [canaryDeployments, setCanaryDeployments] = useState<CanaryDeployment[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<ModelDeployment | null>(
    null
  );

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setDeployments(deploymentManager.getAllDeployments());
    setCanaryDeployments(deploymentManager.getAllCanaryDeployments());
    if (selectedDeployment) {
      const updated = deploymentManager.getDeployment(selectedDeployment.id);
      if (updated) setSelectedDeployment(updated);
    }
  };

  return (
    <div className="h-full flex gap-4">
      {/* 部署列表 */}
      <div className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          部署列表
        </h2>

        <div className="space-y-2">
          {deployments.map(deployment => (
            <DeploymentCard
              key={deployment.id}
              deployment={deployment}
              selected={selectedDeployment?.id === deployment.id}
              onClick={() => setSelectedDeployment(deployment)}
            />
          ))}

          {deployments.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <Rocket className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>还没有部署</p>
            </div>
          )}
        </div>
      </div>

      {/* 部署详情 */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 overflow-y-auto">
        {selectedDeployment ? (
          <div className="space-y-6">
            {/* 头部信息 */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedDeployment.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={selectedDeployment.status} />
                    <span className="text-slate-400">
                      {selectedDeployment.environment}
                    </span>
                    <span className="text-slate-400">
                      v{selectedDeployment.version}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {selectedDeployment.traffic}%
                  </div>
                  <div className="text-sm text-slate-400">流量分配</div>
                </div>
              </div>

              {/* 健康状态 */}
              {selectedDeployment.lastHealthCheck && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">健康检查</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(selectedDeployment.lastHealthCheck).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 关键指标 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">关键指标</h3>
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  label="请求数"
                  value={selectedDeployment.metrics.requestCount.toLocaleString()}
                  icon={<Activity />}
                />
                <MetricCard
                  label="成功率"
                  value={`${(selectedDeployment.metrics.successRate * 100).toFixed(1)}%`}
                  icon={<CheckCircle />}
                  trend={
                    selectedDeployment.metrics.successRate > 0.95 ? 'good' : 'bad'
                  }
                />
                <MetricCard
                  label="平均延迟"
                  value={`${selectedDeployment.metrics.avgLatency.toFixed(0)}ms`}
                  icon={<TrendingUp />}
                />
                <MetricCard
                  label="正常运行时间"
                  value={`${selectedDeployment.metrics.uptime.toFixed(1)}%`}
                  icon={<CheckCircle />}
                  trend={selectedDeployment.metrics.uptime > 99 ? 'good' : 'warning'}
                />
              </div>

              {/* 延迟分布 */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">P95延迟</div>
                  <div className="text-xl font-bold text-white">
                    {selectedDeployment.metrics.p95Latency.toFixed(0)}ms
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">P99延迟</div>
                  <div className="text-xl font-bold text-white">
                    {selectedDeployment.metrics.p99Latency.toFixed(0)}ms
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">错误数</div>
                  <div className="text-xl font-bold text-white">
                    {selectedDeployment.metrics.errorCount}
                  </div>
                </div>
              </div>
            </div>

            {/* 资源配置 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">资源配置</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">副本数</span>
                  <span className="text-white font-semibold">
                    {selectedDeployment.config.replicas}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">CPU</span>
                  <span className="text-white font-semibold">
                    {selectedDeployment.config.resources.cpu}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">内存</span>
                  <span className="text-white font-semibold">
                    {selectedDeployment.config.resources.memory}
                  </span>
                </div>
                {selectedDeployment.config.resources.gpu && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GPU</span>
                    <span className="text-white font-semibold">
                      {selectedDeployment.config.resources.gpu}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 自动扩缩容 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">自动扩缩容</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">最小副本数</span>
                  <span className="text-white font-semibold">
                    {selectedDeployment.config.scaling.minReplicas}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">最大副本数</span>
                  <span className="text-white font-semibold">
                    {selectedDeployment.config.scaling.maxReplicas}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">目标CPU</span>
                  <span className="text-white font-semibold">
                    {selectedDeployment.config.scaling.targetCPU}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">目标内存</span>
                  <span className="text-white font-semibold">
                    {selectedDeployment.config.scaling.targetMemory}%
                  </span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  /* 回滚逻辑 */
                }}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                回滚
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deploymentManager.stopDeployment(selectedDeployment.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
              >
                停止部署
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Rocket className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>选择一个部署查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 部署卡片
const DeploymentCard: React.FC<{
  deployment: ModelDeployment;
  selected: boolean;
  onClick: () => void;
}> = ({ deployment, selected, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        selected ? 'bg-blue-600 shadow-lg' : 'bg-slate-700/50 hover:bg-slate-700'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-white">{deployment.name}</h3>
          <div className="text-sm text-slate-300 mt-1">v{deployment.version}</div>
        </div>
        <StatusBadge status={deployment.status} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{deployment.environment}</span>
        <span className="text-white font-semibold">{deployment.traffic}%</span>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-600 flex items-center justify-between text-xs">
        <div className="text-slate-400">
          成功率: {(deployment.metrics.successRate * 100).toFixed(1)}%
        </div>
        <div className="text-slate-400">
          {deployment.metrics.avgLatency.toFixed(0)}ms
        </div>
      </div>
    </motion.div>
  );
};

// 状态徽章
const StatusBadge: React.FC<{ status: ModelDeployment['status'] }> = ({ status }) => {
  const colors = {
    deploying: 'bg-yellow-500/20 text-yellow-300',
    active: 'bg-green-500/20 text-green-300',
    inactive: 'bg-gray-500/20 text-gray-300',
    failed: 'bg-red-500/20 text-red-300',
    'rolling-back': 'bg-orange-500/20 text-orange-300',
  };

  const labels = {
    deploying: '部署中',
    active: '活跃',
    inactive: '未激活',
    failed: '失败',
    'rolling-back': '回滚中',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

// 指标卡片
const MetricCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'good' | 'warning' | 'bad';
}> = ({ label, value, icon, trend }) => (
  <div className="bg-slate-800/50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400 text-sm">{label}</span>
      <span
        className={
          trend === 'good'
            ? 'text-green-400'
            : trend === 'warning'
            ? 'text-yellow-400'
            : trend === 'bad'
            ? 'text-red-400'
            : 'text-blue-400'
        }
      >
        {icon}
      </span>
    </div>
    <div className="text-xl font-bold text-white">{value}</div>
  </div>
);
