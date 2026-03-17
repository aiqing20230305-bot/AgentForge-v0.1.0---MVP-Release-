/**
 * 评估面板
 * 性能评估、A/B测试管理
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TestTube,
  Play,
  BarChart3,
  GitCompare,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  evaluationSystem,
  EvaluationResult,
  ABTest,
  TestSuite,
} from '../../services/training';

export const EvaluationPanel: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [abTests, setABTests] = useState<ABTest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'evaluate' | 'abtest'>('evaluate');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTestSuites(evaluationSystem.getAllTestSuites());
    setABTests(evaluationSystem.getAllABTests());
  };

  const handleRunEvaluation = async (testSuiteId: string, modelId: string) => {
    const result = await evaluationSystem.runEvaluation(testSuiteId, modelId);
    setEvaluations([...evaluations, result]);
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6">
      {/* 标签页 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedTab('evaluate')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            selectedTab === 'evaluate'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <TestTube className="w-5 h-5" />
          性能评估
        </button>
        <button
          onClick={() => setSelectedTab('abtest')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            selectedTab === 'abtest'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          <GitCompare className="w-5 h-5" />
          A/B 测试
        </button>
      </div>

      {/* 内容区域 */}
      {selectedTab === 'evaluate' ? (
        <EvaluationTab
          testSuites={testSuites}
          evaluations={evaluations}
          onRunEvaluation={handleRunEvaluation}
        />
      ) : (
        <ABTestTab abTests={abTests} onUpdate={loadData} />
      )}
    </div>
  );
};

// 评估标签页
const EvaluationTab: React.FC<{
  testSuites: TestSuite[];
  evaluations: EvaluationResult[];
  onRunEvaluation: (testSuiteId: string, modelId: string) => void;
}> = ({ testSuites, evaluations, onRunEvaluation }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationResult | null>(
    null
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* 左侧：测试套件和评估列表 */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">测试套件</h3>
          <div className="space-y-2">
            {testSuites.map(suite => (
              <div
                key={suite.id}
                className="bg-slate-800/50 rounded-lg p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{suite.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{suite.description}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      {suite.testCases.length} 个测试用例
                    </div>
                  </div>
                  <button
                    onClick={() => onRunEvaluation(suite.id, 'model-1')}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    运行
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">评估结果</h3>
          <div className="space-y-2">
            {evaluations.map(result => (
              <motion.div
                key={result.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedEvaluation(result)}
                className={`bg-slate-800/50 rounded-lg p-3 cursor-pointer ${
                  selectedEvaluation?.id === result.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">
                      模型: {result.modelId}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      通过率: {(result.summary.passRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {result.metrics.f1Score.toFixed(3)}
                    </div>
                    <div className="text-xs text-slate-500">F1 Score</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧：评估详情 */}
      <div>
        {selectedEvaluation ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">评估详情</h3>

              {/* 指标雷达图 */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart
                    data={[
                      {
                        metric: '准确率',
                        value: selectedEvaluation.metrics.accuracy,
                      },
                      {
                        metric: '精确率',
                        value: selectedEvaluation.metrics.precision,
                      },
                      {
                        metric: '召回率',
                        value: selectedEvaluation.metrics.recall,
                      },
                      {
                        metric: 'F1分数',
                        value: selectedEvaluation.metrics.f1Score,
                      },
                      {
                        metric: 'BLEU',
                        value: selectedEvaluation.metrics.bleuScore || 0,
                      },
                    ]}
                  >
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                    <PolarRadiusAxis domain={[0, 1]} stroke="#9CA3AF" />
                    <Radar
                      name="指标"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 指标卡片 */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <MetricCard
                  label="延迟"
                  value={`${selectedEvaluation.metrics.latency.toFixed(0)}ms`}
                />
                <MetricCard
                  label="吞吐量"
                  value={`${selectedEvaluation.metrics.throughput.toFixed(0)} req/s`}
                />
              </div>
            </div>

            {/* 测试结果 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">测试结果</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedEvaluation.testResults.map((result, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3"
                  >
                    {result.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium mb-1">
                        测试 #{i + 1} - 得分: {result.score.toFixed(3)}
                      </div>
                      {result.error && (
                        <div className="text-xs text-red-400">{result.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>选择一个评估结果查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// A/B测试标签页
const ABTestTab: React.FC<{
  abTests: ABTest[];
  onUpdate: () => void;
}> = ({ abTests, onUpdate }) => {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* 左侧：A/B测试列表 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">A/B 测试</h3>
        <div className="space-y-2">
          {abTests.map(test => (
            <motion.div
              key={test.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedTest(test)}
              className={`bg-slate-800/50 rounded-lg p-3 cursor-pointer ${
                selectedTest?.id === test.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{test.name}</h4>
                  <p className="text-sm text-slate-400 mt-1">{test.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <StatusBadge status={test.status} />
                    <span className="text-xs text-slate-500">
                      {test.variants.length} 个变体
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 右侧：A/B测试详情 */}
      <div>
        {selectedTest ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">测试详情</h3>

              {/* 变体对比 */}
              {selectedTest.results && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">变体对比</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={selectedTest.variants.map(variant => ({
                        name: variant.name,
                        'F1分数':
                          selectedTest.results?.variants[variant.id]?.metrics.f1Score || 0,
                        准确率:
                          selectedTest.results?.variants[variant.id]?.metrics.accuracy || 0,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="F1分数" fill="#3B82F6" />
                      <Bar dataKey="准确率" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>

                  {selectedTest.results.winner && (
                    <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-300">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-semibold">
                          获胜者:{' '}
                          {
                            selectedTest.variants.find(
                              v => v.id === selectedTest.results!.winner
                            )?.name
                          }
                        </span>
                      </div>
                      {selectedTest.results.statisticalSignificance && (
                        <div className="text-sm text-green-400 mt-1">
                          具有统计显著性
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <GitCompare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>选择一个A/B测试查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 状态徽章
const StatusBadge: React.FC<{ status: ABTest['status'] }> = ({ status }) => {
  const colors = {
    draft: 'bg-gray-500/20 text-gray-300',
    running: 'bg-green-500/20 text-green-300',
    completed: 'bg-blue-500/20 text-blue-300',
    cancelled: 'bg-red-500/20 text-red-300',
  };

  const labels = {
    draft: '草稿',
    running: '运行中',
    completed: '已完成',
    cancelled: '已取消',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

// 指标卡片
const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-slate-700/50 rounded-lg p-3">
    <div className="text-sm text-slate-400 mb-1">{label}</div>
    <div className="text-lg font-bold text-white">{value}</div>
  </div>
);
