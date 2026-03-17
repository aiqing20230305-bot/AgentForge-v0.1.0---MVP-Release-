/**
 * GitHub Config Panel
 * GitHub 集成配置面板
 */

import React, { useState, useEffect } from 'react';
import { Save, TestTube, GitBranch, Settings } from 'lucide-react';
import { githubClient, GitHubConfig } from '../../services/integrations/github/githubClient';
import { githubSyncService, GitHubSyncConfig } from '../../services/integrations/github/githubSyncService';

interface Props {
  onStatusChange: () => void;
  onSyncStatsChange: () => void;
}

export const GitHubConfigPanel: React.FC<Props> = ({ onStatusChange, onSyncStatsChange }) => {
  const [config, setConfig] = useState<GitHubConfig>({
    token: '',
    owner: '',
    repo: ''
  });

  const [syncConfig, setSyncConfig] = useState<GitHubSyncConfig>({
    enabled: false,
    syncInterval: 5,
    autoCreateIssues: false,
    autoCreateBranches: true,
    autoCloseTasks: true,
    branchPrefix: 'feature/',
    labelMapping: {
      bug: 'bug',
      feature: 'enhancement',
      documentation: 'documentation'
    }
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const stored = localStorage.getItem('github_config');
      if (stored) {
        const data = JSON.parse(stored);
        setConfig(data.connection || config);
        setSyncConfig(data.sync || syncConfig);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('github_config', JSON.stringify({
        connection: config,
        sync: syncConfig
      }));

      githubClient.initialize(config);
      githubSyncService.initialize(syncConfig);

      setTestResult({ success: true, message: '配置已保存' });
      onStatusChange();
      onSyncStatsChange();
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '保存失败'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      githubClient.initialize(config);
      const success = await githubClient.testConnection();

      if (success) {
        setTestResult({ success: true, message: '连接成功！' });
        onStatusChange();
      } else {
        setTestResult({ success: false, message: '连接失败，请检查配置' });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Settings */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          连接设置
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Personal Access Token
            </label>
            <input
              type="password"
              value={config.token}
              onChange={e => setConfig({ ...config, token: e.target.value })}
              placeholder="ghp_••••••••••••••••"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              在 GitHub Settings → Developer settings → Personal access tokens 中创建
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              仓库所有者
            </label>
            <input
              type="text"
              value={config.owner}
              onChange={e => setConfig({ ...config, owner: e.target.value })}
              placeholder="username or organization"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              仓库名称
            </label>
            <input
              type="text"
              value={config.repo}
              onChange={e => setConfig({ ...config, repo: e.target.value })}
              placeholder="repository-name"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={testing || !config.token || !config.owner || !config.repo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <TestTube className="w-4 h-4" />
            {testing ? '测试中...' : '测试连接'}
          </button>

          {testResult && (
            <div
              className={`p-3 rounded-lg ${
                testResult.success
                  ? 'bg-green-900/30 border border-green-700 text-green-400'
                  : 'bg-red-900/30 border border-red-700 text-red-400'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          同步设置
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">启用自动同步</label>
              <p className="text-xs text-gray-400">定期同步任务和 Issues/PRs</p>
            </div>
            <input
              type="checkbox"
              checked={syncConfig.enabled}
              onChange={e => setSyncConfig({ ...syncConfig, enabled: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              同步间隔（分钟）
            </label>
            <input
              type="number"
              value={syncConfig.syncInterval}
              onChange={e => setSyncConfig({ ...syncConfig, syncInterval: parseInt(e.target.value) || 5 })}
              min="1"
              max="60"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">自动创建 Issues</label>
              <p className="text-xs text-gray-400">为新任务自动创建 GitHub Issue</p>
            </div>
            <input
              type="checkbox"
              checked={syncConfig.autoCreateIssues}
              onChange={e => setSyncConfig({ ...syncConfig, autoCreateIssues: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">自动创建分支</label>
              <p className="text-xs text-gray-400">为任务自动创建 Git 分支</p>
            </div>
            <input
              type="checkbox"
              checked={syncConfig.autoCreateBranches}
              onChange={e => setSyncConfig({ ...syncConfig, autoCreateBranches: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">PR 合并后自动关闭任务</label>
              <p className="text-xs text-gray-400">当 PR 合并时自动完成任务</p>
            </div>
            <input
              type="checkbox"
              checked={syncConfig.autoCloseTasks}
              onChange={e => setSyncConfig({ ...syncConfig, autoCloseTasks: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              分支前缀
            </label>
            <input
              type="text"
              value={syncConfig.branchPrefix}
              onChange={e => setSyncConfig({ ...syncConfig, branchPrefix: e.target.value })}
              placeholder="feature/"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              例如: feature/, bugfix/, hotfix/
            </p>
          </div>

          {/* Label Mapping */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              标签映射
            </label>
            <div className="space-y-2">
              {Object.entries(syncConfig.labelMapping).map(([local, github]) => (
                <div key={local} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-32">{local}:</span>
                  <input
                    type="text"
                    value={github}
                    onChange={e => setSyncConfig({
                      ...syncConfig,
                      labelMapping: {
                        ...syncConfig.labelMapping,
                        [local]: e.target.value
                      }
                    })}
                    className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
};
