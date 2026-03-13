/**
 * 数据源管理器
 * 支持管理多个 OpenClaw 实例和其他 Agent 数据源
 */

import { useState } from 'react'
import {
  X,
  Plus,
  Server,
  Cloud,
  Terminal,
  Trash2,
  Edit2,
  Check,
  Star,
  Power,
  Zap,
  ChevronRight,
  Loader,
  CheckCircle,
  XCircle
} from 'lucide-react'
import {
  useDataSourceStore,
  type DataSource,
  type DataSourceType
} from '../store/useDataSourceStore'
import { adapterManager } from '../adapters'

interface DataSourceManagerProps {
  onClose: () => void
}

// 数据源类型配置
const SOURCE_TYPE_CONFIG: Record<
  DataSourceType,
  { name: string; icon: any; color: string; description: string }
> = {
  openclaw: {
    name: 'OpenClaw',
    icon: Server,
    color: '#3b82f6',
    description: 'OpenClaw Gateway 连接'
  },
  'custom-api': {
    name: '自定义 API',
    icon: Cloud,
    color: '#10b981',
    description: '连接自定义 Agent API'
  },
  'local-script': {
    name: '本地脚本',
    icon: Terminal,
    color: '#8b5cf6',
    description: '运行本地脚本获取 Agent'
  },
  'ssh-remote': {
    name: 'SSH 远程',
    icon: Server,
    color: '#f59e0b',
    description: 'SSH 连接远程 OpenClaw'
  }
}

export default function DataSourceManager({ onClose }: DataSourceManagerProps) {
  const {
    sources,
    removeSource,
    toggleSourceEnabled,
    setDefaultSource,
    setActiveSource,
    activeSourceId
  } = useDataSourceStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个数据源吗？')) {
      removeSource(id)
    }
  }

  const handleSetDefault = (id: string) => {
    setDefaultSource(id)
  }

  const handleSetActive = (id: string) => {
    setActiveSource(activeSourceId === id ? null : id)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-700 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Server className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">数据源管理</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  管理多个 OpenClaw 实例和其他 Agent 数据源
                </p>
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
          <div className="flex-1 overflow-y-auto p-6">
            {/* 添加按钮 */}
            <div className="mb-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/30"
              >
                <Plus className="w-4 h-4" />
                添加数据源
              </button>
            </div>

            {/* 数据源列表 */}
            {sources.length === 0 ? (
              <div className="text-center py-12">
                <Server className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <div className="text-slate-400 mb-2">还没有配置任何数据源</div>
                <div className="text-xs text-slate-500">点击上方按钮添加第一个数据源</div>
              </div>
            ) : (
              <div className="space-y-3">
                {sources.map(source => {
                  const typeConfig = SOURCE_TYPE_CONFIG[source.type]
                  const Icon = typeConfig.icon
                  const isActive = activeSourceId === source.id

                  return (
                    <div
                      key={source.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-purple-500/10 border-purple-500/50'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* 图标 */}
                        <div
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: `${typeConfig.color}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: typeConfig.color }} />
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white truncate">{source.name}</h3>
                            {source.isDefault && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[10px] text-amber-400">
                                <Star className="w-3 h-3 fill-current" />
                                默认
                              </div>
                            )}
                            {isActive && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] text-purple-400">
                                <Check className="w-3 h-3" />
                                当前
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-slate-400 mb-2">
                            {source.description || typeConfig.description}
                          </div>

                          {/* OpenClaw URL */}
                          {source.type === 'openclaw' && (
                            <div className="text-xs text-slate-500 font-mono">
                              {(source.config as any).gatewayUrl}
                            </div>
                          )}

                          {/* 状态和操作 */}
                          <div className="flex items-center gap-2 mt-3">
                            {/* 启用/禁用 */}
                            <button
                              onClick={() => toggleSourceEnabled(source.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                source.enabled
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              {source.enabled ? '已启用' : '已禁用'}
                            </button>

                            {/* 设为默认 */}
                            {!source.isDefault && source.enabled && (
                              <button
                                onClick={() => handleSetDefault(source.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-700 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400 transition-all"
                              >
                                <Star className="w-3 h-3" />
                                设为默认
                              </button>
                            )}

                            {/* 设为当前 */}
                            {source.enabled && !isActive && (
                              <button
                                onClick={() => handleSetActive(source.id)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-700 text-slate-400 hover:bg-purple-500/20 hover:text-purple-400 transition-all"
                              >
                                <ChevronRight className="w-3 h-3" />
                                切换到此源
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setEditingSource(source)}
                            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(source.id)}
                            className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-all"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-900/50">
            <div className="text-xs text-slate-500">
              共 {sources.length} 个数据源 · {sources.filter(s => s.enabled).length} 个已启用
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium transition-all shadow-lg hover:shadow-purple-500/50"
            >
              完成
            </button>
          </div>
        </div>
      </div>

      {/* 添加数据源模态框 */}
      {showAddModal && (
        <AddDataSourceModal
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            setShowAddModal(false)
          }}
        />
      )}

      {/* 编辑数据源模态框 */}
      {editingSource && (
        <EditDataSourceModal
          source={editingSource}
          onClose={() => setEditingSource(null)}
          onSave={() => {
            setEditingSource(null)
          }}
        />
      )}
    </>
  )
}

// 添加数据源模态框（增强版）
function AddDataSourceModal({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const { addSource } = useDataSourceStore()
  const [selectedType] = useState<DataSourceType>('openclaw')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [gatewayUrl, setGatewayUrl] = useState('http://localhost:18790')
  const [authToken, setAuthToken] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // 测试连接
  const handleTest = async () => {
    if (!gatewayUrl || !authToken) {
      setTestResult({ success: false, message: '请填写完整配置信息' })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      // 创建临时数据源用于测试
      const tempSource: DataSource = {
        id: 'temp',
        name: name || '测试',
        description,
        type: selectedType,
        config: {
          gatewayUrl,
          authToken
        },
        enabled: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await adapterManager.testConnection(tempSource)
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

  const handleAdd = () => {
    if (!name || !gatewayUrl || !authToken) {
      alert('请填写所有必填字段')
      return
    }

    addSource({
      name,
      description,
      type: selectedType,
      config: {
        gatewayUrl,
        authToken
      },
      enabled: true,
      isDefault: false
    })

    onAdd()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">添加数据源</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：腾讯云 OpenClaw"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">描述</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="数据源描述（可选）"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Gateway URL *</label>
            <input
              type="text"
              value={gatewayUrl}
              onChange={e => setGatewayUrl(e.target.value)}
              placeholder="http://localhost:18790"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Auth Token *</label>
            <input
              type="password"
              value={authToken}
              onChange={e => setAuthToken(e.target.value)}
              placeholder="输入认证 Token"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* 测试连接按钮 */}
          <button
            onClick={handleTest}
            disabled={testing || !gatewayUrl || !authToken}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                测试中...
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
              className={`p-3 rounded border flex items-start gap-2 ${
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

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            disabled={!testResult?.success}
            className="flex-1 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition-colors"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  )
}

// 编辑数据源模态框（简化版）
function EditDataSourceModal({
  source,
  onClose,
  onSave
}: {
  source: DataSource
  onClose: () => void
  onSave: () => void
}) {
  const { updateSource } = useDataSourceStore()
  const [name, setName] = useState(source.name)
  const [gatewayUrl, setGatewayUrl] = useState((source.config as any).gatewayUrl || '')
  const [authToken, setAuthToken] = useState((source.config as any).authToken || '')

  const handleSave = () => {
    updateSource(source.id, {
      name,
      config: {
        gatewayUrl,
        authToken
      }
    })
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">编辑数据源</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Gateway URL</label>
            <input
              type="text"
              value={gatewayUrl}
              onChange={e => setGatewayUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Auth Token</label>
            <input
              type="password"
              value={authToken}
              onChange={e => setAuthToken(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm font-mono"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
