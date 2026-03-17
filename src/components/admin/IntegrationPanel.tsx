/**
 * Integration Panel
 * 集成管理面板 - 配置 Jira 和 GitHub 集成
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Link,
  Unlink,
  AlertCircle,
  Activity,
  GitBranch,
  GitPullRequest
} from 'lucide-react';
import { jiraClient } from '../../services/integrations/jira/jiraClient';
import { jiraSyncService } from '../../services/integrations/jira/jiraSyncService';
import { githubClient } from '../../services/integrations/github/githubClient';
import { githubSyncService } from '../../services/integrations/github/githubSyncService';
import { JiraConfigPanel } from './JiraConfigPanel';
import { GitHubConfigPanel } from './GitHubConfigPanel';
import { StatusMappingPanel } from './StatusMappingPanel';
import { SyncHistoryPanel } from './SyncHistoryPanel';

type TabType = 'jira' | 'github' | 'status-mapping' | 'sync-history';

interface ConnectionStatus {
  jira: {
    connected: boolean;
    testing: boolean;
    error?: string;
  };
  github: {
    connected: boolean;
    testing: boolean;
    error?: string;
  };
}

export const IntegrationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('jira');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    jira: { connected: false, testing: false },
    github: { connected: false, testing: false }
  });
  const [syncStats, setSyncStats] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadConnectionStatus();
    loadSyncStats();
  }, []);

  const loadConnectionStatus = async () => {
    // 检查 Jira 连接
    try {
      setConnectionStatus(prev => ({
        ...prev,
        jira: { ...prev.jira, testing: true }
      }));

      const jiraConnected = await jiraClient.testConnection();

      setConnectionStatus(prev => ({
        ...prev,
        jira: { connected: jiraConnected, testing: false }
      }));
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        jira: {
          connected: false,
          testing: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      }));
    }

    // 检查 GitHub 连接
    try {
      setConnectionStatus(prev => ({
        ...prev,
        github: { ...prev.github, testing: true }
      }));

      const githubConnected = await githubClient.testConnection();

      setConnectionStatus(prev => ({
        ...prev,
        github: { connected: githubConnected, testing: false }
      }));
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        github: {
          connected: false,
          testing: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      }));
    }
  };

  const loadSyncStats = () => {
    const jiraStats = jiraSyncService.getSyncStats();
    const githubStats = githubSyncService.getSyncStats();

    setSyncStats({
      jira: jiraStats,
      github: githubStats
    });
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const [jiraResult, githubResult] = await Promise.all([
        jiraSyncService.manualSync(),
        githubSyncService.manualSync()
      ]);

      console.log('Sync completed:', { jiraResult, githubResult });

      // 重新加载统计信息
      loadSyncStats();

      // 显示成功消息
      alert('同步完成！');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('同步失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSyncing(false);
    }
  };

  const renderConnectionStatus = (
    platform: 'jira' | 'github',
    status: ConnectionStatus['jira'] | ConnectionStatus['github']
  ) => {
    if (status.testing) {
      return (
        <div className="flex items-center gap-2 text-yellow-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>测试连接中...</span>
        </div>
      );
    }

    if (status.connected) {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span>已连接</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-red-400">
        <XCircle className="w-4 h-4" />
        <span>未连接</span>
        {status.error && (
          <span className="text-xs text-gray-400">({status.error})</span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-400" />
              项目管理集成
            </h2>
            <p className="text-gray-400 mt-1">配置 Jira 和 GitHub 集成</p>
          </div>

          <div className="flex items-center gap-4">
            {/* 同步按钮 */}
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? '同步中...' : '手动同步'}
            </button>

            {/* 刷新连接状态 */}
            <button
              onClick={loadConnectionStatus}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Connection Status Bar */}
        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-sm text-gray-400 mb-1">Jira</div>
                {renderConnectionStatus('jira', connectionStatus.jira)}
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-1">GitHub</div>
                {renderConnectionStatus('github', connectionStatus.github)}
              </div>
            </div>

            {syncStats && (
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Jira 映射: </span>
                  <span className="text-white font-semibold">{syncStats.jira.totalMappings}</span>
                </div>
                <div>
                  <span className="text-gray-400">GitHub 映射: </span>
                  <span className="text-white font-semibold">{syncStats.github.totalMappings}</span>
                </div>
                {syncStats.jira.lastSyncAt && (
                  <div>
                    <span className="text-gray-400">上次同步: </span>
                    <span className="text-white">{new Date(syncStats.jira.lastSyncAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 px-6">
          {[
            { id: 'jira' as const, label: 'Jira 配置', icon: Link },
            { id: 'github' as const, label: 'GitHub 配置', icon: GitBranch },
            { id: 'status-mapping' as const, label: '状态映射', icon: GitPullRequest },
            { id: 'sync-history' as const, label: '同步历史', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'jira' && (
            <JiraConfigPanel
              onStatusChange={loadConnectionStatus}
              onSyncStatsChange={loadSyncStats}
            />
          )}

          {activeTab === 'github' && (
            <GitHubConfigPanel
              onStatusChange={loadConnectionStatus}
              onSyncStatsChange={loadSyncStats}
            />
          )}

          {activeTab === 'status-mapping' && (
            <StatusMappingPanel />
          )}

          {activeTab === 'sync-history' && (
            <SyncHistoryPanel />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <span>配置更改将立即生效</span>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('close-integration-panel'))}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
