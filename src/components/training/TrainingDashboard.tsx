/**
 * 训练监控仪表板
 * 实时监控训练进度和指标
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  TrendingUp,
  Activity,
  Clock,
  Cpu,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  trainingEngine,
  TrainingJob,
  TrainingConfig,
} from '../../services/training';

export const TrainingDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<TrainingJob | null>(null);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 1000); // 每秒更新
    return () => clearInterval(interval);
  }, []);

  const loadJobs = () => {
    const allJobs = trainingEngine.getAllTrainingJobs();
    setJobs(allJobs);
    if (selectedJob) {
      const updated = trainingEngine.getTrainingJob(selectedJob.id);
      if (updated) setSelectedJob(updated);
    }
  };

  const handleStartTraining = async (jobId: string) => {
    try {
      await trainingEngine.startTraining(jobId);
    } catch (error) {
      console.error('Failed to start training:', error);
    }
  };

  const handlePauseTraining = (jobId: string) => {
    trainingEngine.pauseTraining(jobId);
  };

  const handleStopTraining = (jobId: string) => {
    trainingEngine.stopTraining(jobId);
  };

  return (
    <div className="h-full flex gap-4">
      {/* 训练任务列表 */}
      <div className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">训练任务</h2>

        <div className="space-y-2">
          {jobs.map(job => (
            <TrainingJobCard
              key={job.id}
              job={job}
              selected={selectedJob?.id === job.id}
              onClick={() => setSelectedJob(job)}
              onStart={() => handleStartTraining(job.id)}
              onPause={() => handlePauseTraining(job.id)}
              onStop={() => handleStopTraining(job.id)}
            />
          ))}

          {jobs.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>还没有训练任务</p>
            </div>
          )}
        </div>
      </div>

      {/* 训练详情 */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 overflow-y-auto">
        {selectedJob ? (
          <div className="space-y-6">
            {/* 头部信息 */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedJob.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={selectedJob.status} />
                    <span className="text-slate-400">
                      模型: {selectedJob.config.baseModel}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedJob.status === 'pending' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartTraining(selectedJob.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      开始
                    </motion.button>
                  )}

                  {selectedJob.status === 'running' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePauseTraining(selectedJob.id)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg flex items-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        暂停
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStopTraining(selectedJob.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
                      >
                        <Square className="w-4 h-4" />
                        停止
                      </motion.button>
                    </>
                  )}

                  {selectedJob.status === 'paused' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartTraining(selectedJob.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      继续
                    </motion.button>
                  )}
                </div>
              </div>

              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    Epoch {selectedJob.progress.currentEpoch}/
                    {selectedJob.progress.totalEpochs}
                  </span>
                  <span className="text-slate-400">
                    {selectedJob.progress.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedJob.progress.percentage}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
                {selectedJob.progress.estimatedTimeRemaining > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    预计剩余时间:{' '}
                    {formatDuration(selectedJob.progress.estimatedTimeRemaining)}
                  </div>
                )}
              </div>
            </div>

            {/* 关键指标 */}
            <div className="grid grid-cols-4 gap-4">
              <MetricCard
                label="当前Loss"
                value={selectedJob.metrics.loss[selectedJob.metrics.loss.length - 1]?.toFixed(4) || 'N/A'}
                trend="down"
                icon={<TrendingUp />}
              />
              <MetricCard
                label="验证Loss"
                value={
                  selectedJob.metrics.validationLoss[
                    selectedJob.metrics.validationLoss.length - 1
                  ]?.toFixed(4) || 'N/A'
                }
                trend="down"
                icon={<Activity />}
              />
              <MetricCard
                label="准确率"
                value={
                  selectedJob.metrics.accuracy[
                    selectedJob.metrics.accuracy.length - 1
                  ]?.toFixed(3) || 'N/A'
                }
                trend="up"
                icon={<Zap />}
              />
              <MetricCard
                label="学习率"
                value={selectedJob.config.hyperparameters.learningRate.toExponential(2)}
                icon={<Cpu />}
              />
            </div>

            {/* 训练曲线 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">训练曲线</h3>

              {/* Loss曲线 */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Loss</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={selectedJob.metrics.loss.map((loss, i) => ({
                      step: i,
                      训练Loss: loss,
                      验证Loss: selectedJob.metrics.validationLoss[i],
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="step" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="训练Loss"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="验证Loss"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 准确率曲线 */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">准确率</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={selectedJob.metrics.accuracy.map((acc, i) => ({
                      step: i,
                      训练准确率: acc,
                      验证准确率: selectedJob.metrics.validationAccuracy[i],
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="step" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={[0, 1]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="训练准确率"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="验证准确率"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 检查点 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">检查点</h3>
              <div className="grid gap-2">
                {selectedJob.checkpoints.map(checkpoint => (
                  <div
                    key={checkpoint.id}
                    className={`bg-slate-800/50 rounded-lg p-3 flex items-center justify-between ${
                      checkpoint.isBest ? 'ring-2 ring-green-500' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">
                        Epoch {checkpoint.epoch}
                        {checkpoint.isBest && (
                          <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded">
                            最佳
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        Loss: {checkpoint.metrics.loss.toFixed(4)} | Accuracy:{' '}
                        {checkpoint.metrics.accuracy.toFixed(3)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(checkpoint.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 训练日志 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">训练日志</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-sm">
                {selectedJob.logs
                  .slice()
                  .reverse()
                  .map((log, i) => (
                    <div
                      key={i}
                      className={`mb-1 ${
                        log.level === 'error'
                          ? 'text-red-400'
                          : log.level === 'warning'
                          ? 'text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    >
                      [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>选择一个训练任务查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 训练任务卡片
const TrainingJobCard: React.FC<{
  job: TrainingJob;
  selected: boolean;
  onClick: () => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}> = ({ job, selected, onClick, onStart, onPause, onStop }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        selected
          ? 'bg-blue-600 shadow-lg'
          : 'bg-slate-700/50 hover:bg-slate-700'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white">{job.name}</h3>
        <StatusBadge status={job.status} />
      </div>

      <div className="space-y-2">
        <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400"
            style={{ width: `${job.progress.percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Epoch {job.progress.currentEpoch}/{job.progress.totalEpochs}
          </span>
          <span>{job.progress.percentage.toFixed(0)}%</span>
        </div>
      </div>

      {selected && (
        <div className="flex gap-1 mt-3" onClick={e => e.stopPropagation()}>
          {job.status === 'pending' && (
            <button
              onClick={onStart}
              className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            >
              开始
            </button>
          )}
          {job.status === 'running' && (
            <>
              <button
                onClick={onPause}
                className="flex-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
              >
                暂停
              </button>
              <button
                onClick={onStop}
                className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                停止
              </button>
            </>
          )}
          {job.status === 'paused' && (
            <button
              onClick={onStart}
              className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
            >
              继续
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// 状态徽章
const StatusBadge: React.FC<{ status: TrainingJob['status'] }> = ({ status }) => {
  const colors = {
    pending: 'bg-gray-500/20 text-gray-300',
    running: 'bg-green-500/20 text-green-300',
    paused: 'bg-yellow-500/20 text-yellow-300',
    completed: 'bg-blue-500/20 text-blue-300',
    failed: 'bg-red-500/20 text-red-300',
  };

  const labels = {
    pending: '待开始',
    running: '运行中',
    paused: '已暂停',
    completed: '已完成',
    failed: '失败',
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
  trend?: 'up' | 'down';
  icon: React.ReactNode;
}> = ({ label, value, trend, icon }) => (
  <div className="bg-slate-800/50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-blue-400">{icon}</span>
    </div>
    <div className="flex items-end justify-between">
      <div className="text-xl font-bold text-white">{value}</div>
      {trend && (
        <TrendingUp
          className={`w-4 h-4 ${
            trend === 'up' ? 'text-green-400' : 'text-red-400 rotate-180'
          }`}
        />
      )}
    </div>
  </div>
);

// 格式化持续时间
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}
