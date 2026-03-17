/**
 * Sync History Panel
 * 同步历史记录面板
 */

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { jiraSyncService } from '../../services/integrations/jira/jiraSyncService';
import { githubSyncService } from '../../services/integrations/github/githubSyncService';

interface SyncHistoryEntry {
  id: string;
  platform: 'jira' | 'github';
  timestamp: string;
  success: boolean;
  created: number;
  updated: number;
  errors: Array<{ taskId: string; error: string }>;
}

export const SyncHistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<SyncHistoryEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'jira' | 'github'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('sync_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load sync history:', error);
    }
  };

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(entry => entry.platform === filter);

  const clearHistory = () => {
    if (confirm('确定要清除所有同步历史吗？')) {
      localStorage.removeItem('sync_history');
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">同步历史</h3>
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center gap-2">
              {['all', 'jira', 'github'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {f === 'all' ? '全部' : f === 'jira' ? 'Jira' : 'GitHub'}
                </button>
              ))}
            </div>

            <button
              onClick={clearHistory}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              清除历史
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无同步历史</p>
            </div>
          ) : (
            filteredHistory.map(entry => (
              <div
                key={entry.id}
                className="p-4 bg-gray-900 rounded-lg border border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {entry.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {entry.platform === 'jira' ? 'Jira' : 'GitHub'} 同步
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          entry.success
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {entry.success ? '成功' : '失败'}
                        </span>
                      </div>

                      <div className="text-sm text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-green-400">创建: {entry.created}</span>
                        <span className="text-blue-400">更新: {entry.updated}</span>
                        {entry.errors.length > 0 && (
                          <span className="text-red-400">错误: {entry.errors.length}</span>
                        )}
                      </div>

                      {entry.errors.length > 0 && (
                        <div className="mt-3 p-3 bg-red-900/10 border border-red-800 rounded">
                          <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>错误详情</span>
                          </div>
                          <div className="space-y-1">
                            {entry.errors.slice(0, 3).map((err, idx) => (
                              <div key={idx} className="text-xs text-red-300">
                                任务 {err.taskId}: {err.error}
                              </div>
                            ))}
                            {entry.errors.length > 3 && (
                              <div className="text-xs text-red-400">
                                还有 {entry.errors.length - 3} 个错误...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">总同步次数</div>
          <div className="text-2xl font-bold text-white">{history.length}</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">成功率</div>
          <div className="text-2xl font-bold text-green-400">
            {history.length > 0
              ? Math.round((history.filter(h => h.success).length / history.length) * 100)
              : 0}
            %
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-1">总错误数</div>
          <div className="text-2xl font-bold text-red-400">
            {history.reduce((sum, h) => sum + h.errors.length, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};
