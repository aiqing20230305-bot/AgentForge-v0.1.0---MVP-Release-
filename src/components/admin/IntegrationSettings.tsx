/**
 * Integration Settings Component
 * UI for configuring Slack and Discord integrations
 */

import React, { useState, useEffect } from 'react'
import { getIntegrationManager, type IntegrationConfig } from '../../services/integrations/IntegrationManager'
import type { NotificationType } from '../../services/notificationService'

const NOTIFICATION_TYPES: Array<{ value: NotificationType; label: string }> = [
  { value: 'task_complete', label: 'Task Completion' },
  { value: 'task_failed', label: 'Task Failure' },
  { value: 'level_up', label: 'Level Up' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'system', label: 'System Alerts' },
  { value: 'agent_idle', label: 'Agent Idle' },
  { value: 'evolution', label: 'Evolution' },
  { value: 'vitality_critical', label: 'Vitality Critical' },
  { value: 'health_warning', label: 'Health Warning' }
]

export default function IntegrationSettings() {
  const [config, setConfig] = useState<IntegrationConfig>({})
  const [testing, setTesting] = useState({ slack: false, discord: false })
  const [testResults, setTestResults] = useState<any>({})
  const [activeTab, setActiveTab] = useState<'slack' | 'discord'>('slack')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = () => {
    const manager = getIntegrationManager()
    setConfig(manager.getConfig())
  }

  const updateSlackConfig = (updates: any) => {
    const newConfig = {
      ...config,
      slack: { ...config.slack, ...updates }
    }
    setConfig(newConfig)
    getIntegrationManager().updateConfig(newConfig)
  }

  const updateDiscordConfig = (updates: any) => {
    const newConfig = {
      ...config,
      discord: { ...config.discord, ...updates }
    }
    setConfig(newConfig)
    getIntegrationManager().updateConfig(newConfig)
  }

  const testConnection = async (platform: 'slack' | 'discord') => {
    setTesting({ ...testing, [platform]: true })
    try {
      const manager = getIntegrationManager()
      const results = await manager.testConnections()
      setTestResults(results)

      const result = results[platform]
      if (result?.success) {
        alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connection successful!`)
      } else {
        alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connection failed: ${result?.error}`)
      }
    } catch (error: any) {
      alert(`Error testing connection: ${error.message}`)
    } finally {
      setTesting({ ...testing, [platform]: false })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Integration Settings</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('slack')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'slack'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">💬</span>
            Slack
          </button>
          <button
            onClick={() => setActiveTab('discord')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'discord'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">🎮</span>
            Discord
          </button>
        </div>

        {/* Slack Settings */}
        {activeTab === 'slack' && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Slack Integration</h2>
              <label className="flex items-center space-x-3 cursor-pointer">
                <span className="text-gray-300">Enabled</span>
                <input
                  type="checkbox"
                  checked={config.slack?.enabled || false}
                  onChange={(e) => updateSlackConfig({ enabled: e.target.checked })}
                  className="w-6 h-6 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>

            {config.slack?.enabled && (
              <>
                {/* Webhook URL */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Webhook URL (Simple Integration)
                  </label>
                  <input
                    type="text"
                    value={config.slack?.webhookUrl || ''}
                    onChange={(e) => updateSlackConfig({ webhookUrl: e.target.value })}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Get this from Slack's Incoming Webhooks app
                  </p>
                </div>

                {/* Bot Token */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bot Token (Advanced Features)
                  </label>
                  <input
                    type="password"
                    value={config.slack?.botToken || ''}
                    onChange={(e) => updateSlackConfig({ botToken: e.target.value })}
                    placeholder="xoxb-..."
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Required for channels, users, and commands
                  </p>
                </div>

                {/* Default Channel */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Channel
                  </label>
                  <input
                    type="text"
                    value={config.slack?.defaultChannel || '#agentforge'}
                    onChange={(e) => updateSlackConfig({ defaultChannel: e.target.value })}
                    placeholder="#agentforge"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* OAuth Settings */}
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">OAuth Settings (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={config.slack?.clientId || ''}
                        onChange={(e) => updateSlackConfig({ clientId: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client Secret
                      </label>
                      <input
                        type="password"
                        value={config.slack?.clientSecret || ''}
                        onChange={(e) => updateSlackConfig({ clientSecret: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Enabled Notifications
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {NOTIFICATION_TYPES.map((type) => (
                      <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.slack?.enabledNotifications?.includes(type.value) ?? true}
                          onChange={(e) => {
                            const current = config.slack?.enabledNotifications || NOTIFICATION_TYPES.map(t => t.value)
                            const updated = e.target.checked
                              ? [...current, type.value]
                              : current.filter(t => t !== type.value)
                            updateSlackConfig({ enabledNotifications: updated })
                          }}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-300">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Test Button */}
                <button
                  onClick={() => testConnection('slack')}
                  disabled={testing.slack}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {testing.slack ? 'Testing...' : 'Test Connection'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Discord Settings */}
        {activeTab === 'discord' && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Discord Integration</h2>
              <label className="flex items-center space-x-3 cursor-pointer">
                <span className="text-gray-300">Enabled</span>
                <input
                  type="checkbox"
                  checked={config.discord?.enabled || false}
                  onChange={(e) => updateDiscordConfig({ enabled: e.target.checked })}
                  className="w-6 h-6 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>

            {config.discord?.enabled && (
              <>
                {/* Webhook URL */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Webhook URL (Simple Integration)
                  </label>
                  <input
                    type="text"
                    value={config.discord?.webhookUrl || ''}
                    onChange={(e) => updateDiscordConfig({ webhookUrl: e.target.value })}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Get this from Server Settings → Integrations → Webhooks
                  </p>
                </div>

                {/* Bot Token */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bot Token (Advanced Features)
                  </label>
                  <input
                    type="password"
                    value={config.discord?.botToken || ''}
                    onChange={(e) => updateDiscordConfig({ botToken: e.target.value })}
                    placeholder="..."
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Required for channels, users, and commands
                  </p>
                </div>

                {/* Guild & Channel */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Guild ID (Server ID)
                    </label>
                    <input
                      type="text"
                      value={config.discord?.guildId || ''}
                      onChange={(e) => updateDiscordConfig({ guildId: e.target.value })}
                      placeholder="123456789..."
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Channel ID
                    </label>
                    <input
                      type="text"
                      value={config.discord?.defaultChannelId || ''}
                      onChange={(e) => updateDiscordConfig({ defaultChannelId: e.target.value })}
                      placeholder="987654321..."
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Bot Settings */}
                <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Bot Settings (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Client ID (Application ID)
                      </label>
                      <input
                        type="text"
                        value={config.discord?.clientId || ''}
                        onChange={(e) => updateDiscordConfig({ clientId: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Public Key
                      </label>
                      <input
                        type="text"
                        value={config.discord?.publicKey || ''}
                        onChange={(e) => updateDiscordConfig({ publicKey: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Enabled Notifications
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {NOTIFICATION_TYPES.map((type) => (
                      <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.discord?.enabledNotifications?.includes(type.value) ?? true}
                          onChange={(e) => {
                            const current = config.discord?.enabledNotifications || NOTIFICATION_TYPES.map(t => t.value)
                            const updated = e.target.checked
                              ? [...current, type.value]
                              : current.filter(t => t !== type.value)
                            updateDiscordConfig({ enabledNotifications: updated })
                          }}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        />
                        <span className="text-gray-300">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Test Button */}
                <button
                  onClick={() => testConnection('discord')}
                  disabled={testing.discord}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {testing.discord ? 'Testing...' : 'Test Connection'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Documentation */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">Setup Instructions</h3>

          {activeTab === 'slack' && (
            <div className="text-gray-300 space-y-3">
              <p><strong>Simple Setup (Webhook):</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Go to your Slack workspace</li>
                <li>Navigate to Settings → Manage Apps</li>
                <li>Search for "Incoming Webhooks" and add it</li>
                <li>Choose a channel and copy the webhook URL</li>
                <li>Paste it above and enable the integration</li>
              </ol>

              <p className="mt-4"><strong>Advanced Setup (Bot):</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Create a Slack App at api.slack.com</li>
                <li>Add OAuth scopes: channels:read, chat:write, users:read</li>
                <li>Install to workspace and copy the Bot Token</li>
                <li>Configure slash commands if needed</li>
              </ol>
            </div>
          )}

          {activeTab === 'discord' && (
            <div className="text-gray-300 space-y-3">
              <p><strong>Simple Setup (Webhook):</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Open Discord server settings</li>
                <li>Go to Integrations → Webhooks</li>
                <li>Create a new webhook and copy the URL</li>
                <li>Paste it above and enable the integration</li>
              </ol>

              <p className="mt-4"><strong>Advanced Setup (Bot):</strong></p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Create a Discord App at discord.com/developers</li>
                <li>Add a bot and copy the token</li>
                <li>Enable required intents: MESSAGE_CONTENT, GUILDS</li>
                <li>Invite bot to your server with proper permissions</li>
                <li>Copy Guild ID and Channel ID (enable Developer Mode)</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
