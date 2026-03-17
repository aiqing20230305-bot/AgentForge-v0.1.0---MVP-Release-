/**
 * SSO Configuration Panel
 * Admin UI for managing SSO providers and settings
 */

import React, { useState, useEffect } from 'react';
import {
  SSOConfig,
  SSOProvider,
  SSOProtocol,
  UserRole,
  SSOConnectionTestResult,
  SSOMetrics,
  SSOAuditLog,
  ssoManager,
} from '../../services/sso';

interface SSOConfigPanelProps {
  onConfigChange?: () => void;
}

export const SSOConfigPanel: React.FC<SSOConfigPanelProps> = ({ onConfigChange }) => {
  const [configs, setConfigs] = useState<SSOConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SSOConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [testResult, setTestResult] = useState<SSOConnectionTestResult | null>(null);
  const [metrics, setMetrics] = useState<SSOMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<SSOAuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'configs' | 'metrics' | 'audit'>('configs');

  useEffect(() => {
    loadConfigs();
    loadMetrics();
    loadAuditLogs();
  }, []);

  const loadConfigs = async () => {
    const allConfigs = ssoManager.getAllConfigs();
    setConfigs(allConfigs);
  };

  const loadMetrics = async () => {
    const ssoMetrics = await ssoManager.getMetrics();
    setMetrics(ssoMetrics);
  };

  const loadAuditLogs = async () => {
    const logs = await ssoManager.getAuditLogs();
    setAuditLogs(logs.slice(0, 50)); // Show last 50 logs
  };

  const handleCreateConfig = () => {
    const newConfig: SSOConfig = {
      id: `sso_${Date.now()}`,
      provider: SSOProvider.CUSTOM,
      protocol: SSOProtocol.SAML2,
      enabled: false,
      name: 'New SSO Configuration',
      userMapping: {
        emailAttribute: 'email',
        firstNameAttribute: 'firstName',
        lastNameAttribute: 'lastName',
        usernameAttribute: 'username',
      },
      roleMapping: {
        defaultRole: UserRole.USER,
        attributeName: 'role',
        rules: [],
      },
      autoProvision: true,
      justInTimeProvisioning: true,
      sessionTimeout: 3600,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSelectedConfig(newConfig);
    setIsEditing(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedConfig) return;

    try {
      if (configs.find((c) => c.id === selectedConfig.id)) {
        await ssoManager.updateConfig(selectedConfig.id, selectedConfig);
      } else {
        await ssoManager.addConfig(selectedConfig);
      }

      await loadConfigs();
      setIsEditing(false);
      setSelectedConfig(null);
      onConfigChange?.();
    } catch (error) {
      alert(`Failed to save configuration: ${error}`);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      await ssoManager.deleteConfig(configId);
      await loadConfigs();
      if (selectedConfig?.id === configId) {
        setSelectedConfig(null);
      }
      onConfigChange?.();
    } catch (error) {
      alert(`Failed to delete configuration: ${error}`);
    }
  };

  const handleToggleConfig = async (configId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await ssoManager.enableConfig(configId);
      } else {
        await ssoManager.disableConfig(configId);
      }
      await loadConfigs();
      onConfigChange?.();
    } catch (error) {
      alert(`Failed to update configuration: ${error}`);
    }
  };

  const handleTestConnection = async (configId: string) => {
    setTestResult(null);
    try {
      const result = await ssoManager.testConnection(configId);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        provider: SSOProvider.CUSTOM,
        protocol: SSOProtocol.SAML2,
        error: error instanceof Error ? error.message : 'Test failed',
      });
    }
  };

  return (
    <div className="sso-config-panel bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">SSO Configuration</h2>
        <button
          onClick={handleCreateConfig}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add SSO Provider
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['configs', 'metrics', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Configurations Tab */}
      {activeTab === 'configs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config List */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Providers</h3>
            <div className="space-y-2">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedConfig?.id === config.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedConfig(config);
                    setIsEditing(false);
                    setTestResult(null);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{config.name}</h4>
                      <p className="text-sm text-gray-500">
                        {config.protocol.toUpperCase()} • {config.provider}
                      </p>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        config.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                </div>
              ))}
              {configs.length === 0 && (
                <p className="text-gray-500 text-center py-8">No SSO providers configured</p>
              )}
            </div>
          </div>

          {/* Config Details */}
          <div className="lg:col-span-2">
            {selectedConfig ? (
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {isEditing ? 'Edit Configuration' : 'Configuration Details'}
                  </h3>
                  <div className="flex space-x-2">
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => handleTestConnection(selectedConfig.id)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Test Connection
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleToggleConfig(selectedConfig.id, !selectedConfig.enabled)
                          }
                          className={`px-3 py-1 text-sm rounded ${
                            selectedConfig.enabled
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {selectedConfig.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(selectedConfig.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {isEditing && (
                      <>
                        <button
                          onClick={handleSaveConfig}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            if (!configs.find((c) => c.id === selectedConfig.id)) {
                              setSelectedConfig(null);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Test Result */}
                {testResult && (
                  <div
                    className={`mb-4 p-4 rounded-lg ${
                      testResult.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <h4
                      className={`font-medium ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                    </h4>
                    {testResult.latency && (
                      <p className="text-sm text-gray-600">Latency: {testResult.latency}ms</p>
                    )}
                    {testResult.error && (
                      <p className="text-sm text-red-600 mt-2">{testResult.error}</p>
                    )}
                  </div>
                )}

                {/* Config Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Configuration Name
                    </label>
                    <input
                      type="text"
                      value={selectedConfig.name}
                      onChange={(e) =>
                        setSelectedConfig({ ...selectedConfig, name: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider
                      </label>
                      <select
                        value={selectedConfig.provider}
                        onChange={(e) =>
                          setSelectedConfig({
                            ...selectedConfig,
                            provider: e.target.value as SSOProvider,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                      >
                        {Object.values(SSOProvider).map((provider) => (
                          <option key={provider} value={provider}>
                            {provider}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Protocol
                      </label>
                      <select
                        value={selectedConfig.protocol}
                        onChange={(e) =>
                          setSelectedConfig({
                            ...selectedConfig,
                            protocol: e.target.value as SSOProtocol,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                      >
                        {Object.values(SSOProtocol).map((protocol) => (
                          <option key={protocol} value={protocol}>
                            {protocol.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedConfig.description || ''}
                      onChange={(e) =>
                        setSelectedConfig({ ...selectedConfig, description: e.target.value })
                      }
                      disabled={!isEditing}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (seconds)
                      </label>
                      <input
                        type="number"
                        value={selectedConfig.sessionTimeout}
                        onChange={(e) =>
                          setSelectedConfig({
                            ...selectedConfig,
                            sessionTimeout: parseInt(e.target.value),
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auto Provision
                      </label>
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          checked={selectedConfig.autoProvision}
                          onChange={(e) =>
                            setSelectedConfig({
                              ...selectedConfig,
                              autoProvision: e.target.checked,
                            })
                          }
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          Automatically create users
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-12 text-center text-gray-500">
                Select a configuration to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers}
            subtitle={`${metrics.totalUsers} total`}
          />
          <MetricCard
            title="Active Sessions"
            value={metrics.activeSessions}
            subtitle={`${metrics.averageSessionDuration.toFixed(0)}s avg duration`}
          />
          <MetricCard
            title="Login Success Rate"
            value={`${metrics.loginSuccessRate.toFixed(1)}%`}
            subtitle={`${metrics.loginsLast24h} logins in 24h`}
          />
          <MetricCard
            title="Failed Logins"
            value={metrics.failedLoginsLast24h}
            subtitle="Last 24 hours"
            alert={metrics.failedLoginsLast24h > 10}
          />
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.event}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.email || log.userId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : log.status === 'failure'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLogs.length === 0 && (
            <p className="text-center text-gray-500 py-8">No audit logs available</p>
          )}
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  alert?: boolean;
}> = ({ title, value, subtitle, alert }) => (
  <div
    className={`p-6 rounded-lg border ${
      alert ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
    }`}
  >
    <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
    <p className={`text-3xl font-bold ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);
