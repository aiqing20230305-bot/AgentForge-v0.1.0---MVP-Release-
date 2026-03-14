import { useState } from 'react'
import { X, Zap, Server, Key, CheckCircle, XCircle, Loader } from 'lucide-react'
import {
  OpenClawConfig,
  getLocalOpenClawConfig,
  saveOpenClawConfig,
  OpenClawAPIClient
} from '../services/openclawApi'

interface OpenClawConfigModalProps {
  onClose: () => void
  onSave: (config: OpenClawConfig) => void
}

export default function OpenClawConfigModal({ onClose, onSave }: OpenClawConfigModalProps) {
  const [config, setConfig] = useState<OpenClawConfig>(getLocalOpenClawConfig())
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const client = new OpenClawAPIClient(config)
      const result = await client.testConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '测试失败'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    saveOpenClawConfig(config)
    onSave(config)
    onClose()
  }

  const loadDefaultConfig = () => {
    setConfig({
      gatewayUrl: 'http://localhost:18789',
      authToken: 'e4d645acd59df43f1032fa5bcee1540238c01e9796296266',
      enabled: true
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">OpenClaw 连接配置</h2>
              <p className="text-xs text-slate-400 mt-0.5">连接到腾讯云或本地 OpenClaw 实例</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 启用开关 */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div>
              <div className="font-semibold text-white">启用 OpenClaw 连接</div>
              <div className="text-xs text-slate-400 mt-1">
                连接到真实的 OpenClaw Gateway 获取实时数据
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Gateway URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Server className="w-4 h-4 text-blue-400" />
              Gateway URL
            </label>
            <input
              type="text"
              value={config.gatewayUrl}
              onChange={e => setConfig({ ...config, gatewayUrl: e.target.value })}
              placeholder="http://localhost:18789"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              disabled={!config.enabled}
            />
            <p className="text-xs text-slate-500 mt-1.5">OpenClaw Gateway 服务地址</p>
          </div>

          {/* Auth Token */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Key className="w-4 h-4 text-amber-400" />
              认证 Token
            </label>
            <input
              type="password"
              value={config.authToken}
              onChange={e => setConfig({ ...config, authToken: e.target.value })}
              placeholder="输入 Gateway Auth Token"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm"
              disabled={!config.enabled}
            />
            <p className="text-xs text-slate-500 mt-1.5">
              在{' '}
              <code className="px-1 py-0.5 bg-slate-700 rounded text-amber-400">
                ~/.openclaw/openclaw.json
              </code>{' '}
              中的 gateway.auth.token
            </p>
          </div>

          {/* 快捷配置 */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Server className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-300 mb-1">使用默认配置</div>
                <div className="text-xs text-blue-400/80 mb-3">
                  使用本地 OpenClaw 配置（上海小龙虾 - 腾讯云服务器）
                </div>
                <button
                  onClick={loadDefaultConfig}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded text-xs text-blue-300 transition-all"
                >
                  加载默认配置
                </button>
              </div>
            </div>
          </div>

          {/* 测试连接 */}
          {config.enabled && (
            <div>
              <button
                onClick={handleTest}
                disabled={testing || !config.gatewayUrl || !config.authToken}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    测试连接中...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    测试连接
                  </>
                )}
              </button>

              {/* 测试结果 */}
              {testResult && (
                <div
                  className={`mt-3 p-3 rounded-lg border flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        testResult.success ? 'text-green-300' : 'text-red-300'
                      }`}
                    >
                      {testResult.success ? '连接成功' : '连接失败'}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        testResult.success ? 'text-green-400/80' : 'text-red-400/80'
                      }`}
                    >
                      {testResult.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium transition-all shadow-lg hover:shadow-amber-500/50"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  )
}
