/**
 * AI训练平台主界面
 * 整合所有训练相关功能
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Activity,
  TestTube,
  Rocket,
  Settings,
} from 'lucide-react';
import { DatasetManager } from './DatasetManager';
import { TrainingDashboard } from './TrainingDashboard';
import { EvaluationPanel } from './EvaluationPanel';
import { DeploymentPanel } from './DeploymentPanel';

type Tab = 'dataset' | 'training' | 'evaluation' | 'deployment';

export const TrainingPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dataset');

  const tabs = [
    { id: 'dataset' as Tab, label: '数据集管理', icon: Database },
    { id: 'training' as Tab, label: '模型训练', icon: Activity },
    { id: 'evaluation' as Tab, label: '性能评估', icon: TestTube },
    { id: 'deployment' as Tab, label: '模型部署', icon: Rocket },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* 头部 */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              AI Agent 训练平台
            </h1>
            <p className="text-slate-400 mt-1">
              数据集管理 · 模型训练 · 性能评估 · 智能部署
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-400">平台版本</div>
              <div className="text-white font-semibold">v1.0.0</div>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="flex gap-2 mt-6">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-6 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeTab === 'dataset' && <DatasetManager />}
          {activeTab === 'training' && <TrainingDashboard />}
          {activeTab === 'evaluation' && <EvaluationPanel />}
          {activeTab === 'deployment' && <DeploymentPanel />}
        </motion.div>
      </div>

      {/* 状态栏 */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-slate-400">
            <span>系统状态: 正常</span>
            <span>·</span>
            <span>GPU 利用率: 45%</span>
            <span>·</span>
            <span>可用内存: 24GB</span>
          </div>
          <div className="text-slate-500">
            © 2024 AgentForge Training Platform
          </div>
        </div>
      </div>
    </div>
  );
};
