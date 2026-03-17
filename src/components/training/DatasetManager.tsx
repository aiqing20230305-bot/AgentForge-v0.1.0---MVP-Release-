/**
 * 数据集管理组件
 * 提供数据集的创建、标注、版本控制界面
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Plus,
  Upload,
  Download,
  Filter,
  Tag,
  GitBranch,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  datasetManager,
  Dataset,
  DataPoint,
  DatasetVersion,
} from '../../services/training';

export const DatasetManager: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuality, setFilterQuality] = useState<number | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>([]);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = () => {
    const allDatasets = datasetManager.getAllDatasets();
    setDatasets(allDatasets);
  };

  const handleCreateDataset = (data: {
    name: string;
    description: string;
    metadata: Dataset['metadata'];
  }) => {
    const dataset = datasetManager.createDataset(
      data.name,
      data.description,
      data.metadata
    );
    loadDatasets();
    setSelectedDataset(dataset);
    setShowCreateModal(false);
  };

  const handleDeleteDataset = (datasetId: string) => {
    if (confirm('确定要删除这个数据集吗？')) {
      datasetManager.deleteDataset(datasetId);
      loadDatasets();
      if (selectedDataset?.id === datasetId) {
        setSelectedDataset(null);
      }
    }
  };

  const handleExportDataset = (datasetId: string, format: 'json' | 'jsonl' | 'csv') => {
    const data = datasetManager.exportDataset(datasetId, format);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset-${datasetId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDataPoints = selectedDataset
    ? datasetManager.filterDataset(selectedDataset.id, {
        minQuality: filterQuality ?? undefined,
        tags: filterTags.length > 0 ? filterTags : undefined,
        search: searchQuery || undefined,
      })
    : [];

  return (
    <div className="h-full flex gap-4">
      {/* 数据集列表 */}
      <div className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6" />
            数据集
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            创建
          </motion.button>
        </div>

        <div className="space-y-2">
          {datasets.map(dataset => (
            <motion.div
              key={dataset.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedDataset(dataset)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedDataset?.id === dataset.id
                  ? 'bg-blue-600 shadow-lg'
                  : 'bg-slate-700/50 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{dataset.name}</h3>
                  <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                    {dataset.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>{dataset.statistics.totalSamples} 样本</span>
                    <span>v{dataset.version}</span>
                  </div>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteDataset(dataset.id);
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {datasets.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>还没有数据集</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-blue-400 hover:underline mt-2"
              >
                创建第一个数据集
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            导入数据集
          </button>
        </div>
      </div>

      {/* 数据集详情 */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 overflow-y-auto">
        {selectedDataset ? (
          <div className="space-y-6">
            {/* 头部 */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedDataset.name}
                </h2>
                <p className="text-slate-300 mt-1">{selectedDataset.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                    v{selectedDataset.version}
                  </span>
                  <span className="text-slate-400">
                    {selectedDataset.metadata.domain}
                  </span>
                  <span className="text-slate-400">
                    {selectedDataset.metadata.language}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExportDataset(selectedDataset.id, 'json')}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出
                </motion.button>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="总样本"
                value={selectedDataset.statistics.totalSamples}
                icon={<Database />}
              />
              <StatCard
                label="平均输入长度"
                value={Math.round(selectedDataset.statistics.avgInputLength)}
                icon={<Edit />}
              />
              <StatCard
                label="平均输出长度"
                value={Math.round(selectedDataset.statistics.avgOutputLength)}
                icon={<Edit />}
              />
              <StatCard
                label="标签数"
                value={Object.keys(selectedDataset.statistics.tagDistribution).length}
                icon={<Tag />}
              />
            </div>

            {/* 过滤器 */}
            <div className="flex gap-4 items-center p-4 bg-slate-800/50 rounded-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索数据点..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 rounded-lg text-white placeholder-slate-400"
                />
              </div>

              <select
                value={filterQuality ?? ''}
                onChange={e =>
                  setFilterQuality(e.target.value ? parseFloat(e.target.value) : null)
                }
                className="px-3 py-2 bg-slate-700 rounded-lg text-white"
              >
                <option value="">所有质量</option>
                <option value="0.8">优秀 (≥0.8)</option>
                <option value="0.6">良好 (≥0.6)</option>
                <option value="0.4">一般 (≥0.4)</option>
              </select>

              <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2">
                <Filter className="w-4 h-4" />
                更多过滤
              </button>
            </div>

            {/* 数据点列表 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">
                数据点 ({filteredDataPoints.length})
              </h3>

              {filteredDataPoints.map(dataPoint => (
                <DataPointCard
                  key={dataPoint.id}
                  dataPoint={dataPoint}
                  datasetId={selectedDataset.id}
                  onUpdate={loadDatasets}
                />
              ))}

              {filteredDataPoints.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>没有符合条件的数据点</p>
                </div>
              )}
            </div>

            {/* 版本历史 */}
            <VersionHistory datasetId={selectedDataset.id} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>选择一个数据集查看详情</p>
            </div>
          </div>
        )}
      </div>

      {/* 创建数据集模态框 */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateDatasetModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateDataset}
          />
        )}
      </AnimatePresence>

      {/* 导入数据集模态框 */}
      <AnimatePresence>
        {showImportModal && (
          <ImportDatasetModal
            onClose={() => setShowImportModal(false)}
            onImport={() => {
              loadDatasets();
              setShowImportModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 统计卡片组件
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="bg-slate-800/50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-blue-400">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
  </div>
);

// 数据点卡片组件
const DataPointCard: React.FC<{
  dataPoint: DataPoint;
  datasetId: string;
  onUpdate: () => void;
}> = ({ dataPoint, datasetId, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [quality, setQuality] = useState(dataPoint.metadata.quality);

  const handleUpdateQuality = () => {
    datasetManager.updateQuality(datasetId, dataPoint.id, quality);
    onUpdate();
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-lg p-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-xs text-slate-400">输入:</span>
            <p className="text-white mt-1">{dataPoint.input}</p>
          </div>
          <div className="mb-2">
            <span className="text-xs text-slate-400">输出:</span>
            <p className="text-white mt-1">{dataPoint.output}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {dataPoint.metadata.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={quality}
                onChange={e => setQuality(parseFloat(e.target.value))}
                className="w-20 px-2 py-1 bg-slate-700 rounded text-white"
              />
              <button
                onClick={handleUpdateQuality}
                className="p-1 text-green-400 hover:text-green-300"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 bg-slate-700 rounded text-white hover:bg-slate-600"
            >
              质量: {dataPoint.metadata.quality.toFixed(2)}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// 版本历史组件
const VersionHistory: React.FC<{ datasetId: string }> = ({ datasetId }) => {
  const [versions, setVersions] = useState<DatasetVersion[]>([]);

  useEffect(() => {
    const history = datasetManager.getVersionHistory(datasetId);
    setVersions(history);
  }, [datasetId]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        版本历史
      </h3>

      <div className="space-y-2">
        {versions.map(version => (
          <div
            key={version.version}
            className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-white">v{version.version}</div>
              <div className="text-sm text-slate-400">{version.changes}</div>
            </div>
            <div className="text-xs text-slate-500">
              {new Date(version.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 创建数据集模态框
const CreateDatasetModal: React.FC<{
  onClose: () => void;
  onCreate: (data: any) => void;
}> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain: '',
    language: 'zh-CN',
    source: 'manual',
    tags: '',
  });

  const handleSubmit = () => {
    onCreate({
      name: formData.name,
      description: formData.description,
      metadata: {
        source: formData.source,
        domain: formData.domain,
        language: formData.language,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-slate-800 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-white mb-4">创建数据集</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
              placeholder="我的数据集"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
              rows={3}
              placeholder="数据集描述..."
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">领域</label>
            <input
              type="text"
              value={formData.domain}
              onChange={e => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
              placeholder="对话、翻译、摘要等"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">语言</label>
            <select
              value={formData.language}
              onChange={e => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
            >
              <option value="zh-CN">中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              标签 (逗号分隔)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
              placeholder="标签1, 标签2"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 导入数据集模态框
const ImportDatasetModal: React.FC<{
  onClose: () => void;
  onImport: () => void;
}> = ({ onClose, onImport }) => {
  const [format, setFormat] = useState<'json' | 'jsonl' | 'csv'>('json');
  const [file, setFile] = useState<File | null>(null);

  const handleImport = async () => {
    if (!file) return;

    const text = await file.text();
    datasetManager.importDataset(
      file.name.replace(/\.[^/.]+$/, ''),
      text,
      format,
      {
        source: 'import',
        domain: 'general',
        language: 'zh-CN',
        tags: ['imported'],
      }
    );

    onImport();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-slate-800 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-white mb-4">导入数据集</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">格式</label>
            <select
              value={format}
              onChange={e => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
            >
              <option value="json">JSON</option>
              <option value="jsonl">JSONL</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">文件</label>
            <input
              type="file"
              accept={format === 'csv' ? '.csv' : '.json,.jsonl'}
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!file}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            导入
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
