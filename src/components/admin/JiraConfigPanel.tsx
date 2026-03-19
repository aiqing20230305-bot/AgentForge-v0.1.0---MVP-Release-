/**
 * Jira Config Panel
 * Jira 集成配置面板
 */

import React, { useState, useEffect } from 'react';
import { Save, TestTube, Link as LinkIcon, Settings } from 'lucide-react';
import { jiraClient, JiraConfig } from '../../services/integrations/jira/jiraClient';
import { jiraSyncService, SyncConfig } from '../../services/integrations/jira/jiraSyncService';

interface Props {
  onStatusChange: () => void;
  onSyncStatsChange: () => void;
}

export const JiraConfigPanel: React.FC<Props> = ({ onStatusChange, onSyncStatsChange }) => {
  const [config, setConfig] = useState<JiraConfig>({
    host: '',
    email: '',
    apiToken: '',
    projectKey: ''
  });

  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    enabled: false,
    syncInterval: 5,
    autoCreateIssues: false,
    autoUpdateIssues: false,
    projectKey: '',
    issueTypeMapping: {
      task: 'Task',
      bug: 'Bug',
      feature: 'Story',
      epic: 'Epic'
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
      const stored = localStorage.getItem('jira_config');
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
      // 保存配置
      localStorage.setItem('jira_config', JSON.stringify({
        connection: config,
        sync: syncConfig
      }));

      // 初始化客户端
      jiraClient.initialize(config);

      // 初始化同步服务
      jiraSyncService.initialize({
        ...syncConfig,
        projectKey: config.projectKey || ''
      });

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
      jiraClient.initialize(config);
      const success = await jiraClient.testConnection();

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
          <LinkIcon className="w-5 h-5 text-blue-400" />
          连接设置
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Jira Host
            </label>
            <input
              type="text"
              value={config.host}
              onChange={e => setConfig({ ...config, host: e.target.value })}
              placeholder="your-domain.atlassian.net"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              不要包含 https://，只输入域名
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={config.email}
              onChange={e => setConfig({ ...config, email: e.target.value })}
              placeholder="your-email@example.com"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Token
            </label>
            <input
              type="password"
              value={config.apiToken}
              onChange={e => setConfig({ ...config, apiToken: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              在 Jira Account Settings → Security → API tokens 中创建
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              默认项目 Key
            </label>
            <input
              type="text"
              value={config.projectKey}
              onChange={e => setConfig({ ...config, projectKey: e.target.value })}
              placeholder="PROJ"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleTest}
            disabled={testing || !config.host || !config.email || !config.apiToken}
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
              <p className="text-xs text-gray-400">定期同步任务和 Issues</p>
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
              <p className="text-xs text-gray-400">为新任务自动创建 Jira Issue</p>
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
              <label className="text-sm font-medium text-gray-300">自动更新 Issues</label>
              <p className="text-xs text-gray-400">从 Jira 拉取更新到本地任务</p>
            </div>
            <input
              type="checkbox"
              checked={syncConfig.autoUpdateIssues}
              onChange={e => setSyncConfig({ ...syncConfig, autoUpdateIssues: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Issue Type Mapping */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue 类型映射
            </label>
            <div className="space-y-2">
              {Object.entries(syncConfig.issueTypeMapping).map(([local, jira]) => (
                <div key={local} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-24">{local}:</span>
                  <input
                    type="text"
                    value={jira}
                    onChange={e => setSyncConfig({
                      ...syncConfig,
                      issueTypeMapping: {
                        ...syncConfig.issueTypeMapping,
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
