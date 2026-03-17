import React, { useState, useEffect } from 'react'
import { brandingManager, BrandConfig } from '../../services/branding/brandingManager'
import { Upload, Download, RefreshCw, Save, Eye, Palette, Type, Link, Settings } from 'lucide-react'

export const BrandingEditor: React.FC = () => {
  const [config, setConfig] = useState<BrandConfig>(brandingManager.getConfig())
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'colors' | 'fonts' | 'features'>('basic')

  useEffect(() => {
    setConfig(brandingManager.getConfig())
  }, [])

  const handleSave = () => {
    brandingManager.updateConfig(config)
    alert('品牌配置已保存并应用！')
  }

  const handleReset = () => {
    if (confirm('确定要重置为默认配置吗？')) {
      brandingManager.reset()
      setConfig(brandingManager.getConfig())
    }
  }

  const handleExport = () => {
    const json = brandingManager.exportConfig()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'branding-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const json = e.target?.result as string
            brandingManager.importConfig(json)
            setConfig(brandingManager.getConfig())
            alert('配置导入成功！')
          } catch (error) {
            alert('导入失败：' + (error as Error).message)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleLogoUpload = async (type: 'primary' | 'favicon' | 'splash') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const base64 = await brandingManager.uploadLogo(file, type)
          setConfig(brandingManager.getConfig())
          alert('Logo上传成功！')
        } catch (error) {
          alert('上传失败：' + (error as Error).message)
        }
      }
    }
    input.click()
  }

  const tabs = [
    { id: 'basic', label: '基本信息', icon: Link },
    { id: 'colors', label: '颜色系统', icon: Palette },
    { id: 'fonts', label: '字体设置', icon: Type },
    { id: 'features', label: '功能配置', icon: Settings },
  ] as const

  return (
    <div className="branding-editor min-h-screen bg-gray-900 p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">品牌定制 (White Label)</h1>
          <p className="text-gray-400 mt-1">完全定制您的品牌外观和体验</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? '退出预览' : '预览'}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="bg-gray-800 rounded-lg p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">基本信息</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">产品名称</label>
              <input
                type="text"
                value={config.productName}
                onChange={(e) => setConfig({ ...config, productName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slogan</label>
              <input
                type="text"
                value={config.slogan}
                onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">公司名称</label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">主Logo</label>
                <button
                  onClick={() => handleLogoUpload('primary')}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  上传Logo
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Favicon</label>
                <button
                  onClick={() => handleLogoUpload('favicon')}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  上传Favicon
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">启动画面</label>
                <button
                  onClick={() => handleLogoUpload('splash')}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  上传启动画面
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={config.contact.email || ''}
                  onChange={(e) => setConfig({ ...config, contact: { ...config.contact, email: e.target.value } })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">网站</label>
                <input
                  type="url"
                  value={config.contact.website || ''}
                  onChange={(e) => setConfig({ ...config, contact: { ...config.contact, website: e.target.value } })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">颜色系统</h2>

            <div className="grid grid-cols-2 gap-6">
              {Object.entries(config.colors).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, [key]: e.target.value },
                        })
                      }
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          colors: { ...config.colors, [key]: e.target.value },
                        })
                      }
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fonts' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">字体设置</h2>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">标题字体</label>
              <input
                type="text"
                value={config.fonts.heading}
                onChange={(e) => setConfig({ ...config, fonts: { ...config.fonts, heading: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: Inter, Roboto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">正文字体</label>
              <input
                type="text"
                value={config.fonts.body}
                onChange={(e) => setConfig({ ...config, fonts: { ...config.fonts, body: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: Inter, Roboto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">代码字体</label>
              <input
                type="text"
                value={config.fonts.code}
                onChange={(e) => setConfig({ ...config, fonts: { ...config.fonts, code: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: JetBrains Mono, Fira Code"
              />
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">
                💡 提示：字体名称需要是 Google Fonts 中的字体名称，系统会自动加载。
              </p>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">功能配置</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.features.showPoweredBy}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      features: { ...config.features, showPoweredBy: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                />
                <span className="text-gray-300">显示 "Powered by AgentForge"</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.features.allowThemeSwitch}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      features: { ...config.features, allowThemeSwitch: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                />
                <span className="text-gray-300">允许用户切换主题</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.features.enableAnalytics}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      features: { ...config.features, enableAnalytics: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600"
                />
                <span className="text-gray-300">启用分析统计</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">自定义CSS</label>
              <textarea
                value={config.customCSS || ''}
                onChange={(e) => setConfig({ ...config, customCSS: e.target.value })}
                className="w-full h-40 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/* 在此输入自定义 CSS */"
              />
            </div>
          </div>
        )}
      </div>

      {/* 预览模式提示 */}
      {previewMode && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          预览模式已启用
        </div>
      )}
    </div>
  )
}
