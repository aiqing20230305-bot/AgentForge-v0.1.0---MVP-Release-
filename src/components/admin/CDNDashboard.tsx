import React, { useState, useEffect } from 'react';
import { Globe, Zap, Database, Activity, TrendingUp, Server, MapPin, AlertCircle } from 'lucide-react';
import { cdnManager, CDNStats, EdgeNode } from '../../services/cdn/cdnManager';
import { globalRouter, GeolocationData } from '../../services/cdn/globalRouter';

interface CDNDashboardProps {
  className?: string;
}

export const CDNDashboard: React.FC<CDNDashboardProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<CDNStats | null>(null);
  const [edgeNodes, setEdgeNodes] = useState<EdgeNode[]>([]);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
  const [historicalStats, setHistoricalStats] = useState<CDNStats[]>([]);

  useEffect(() => {
    // 初始化 CDN
    cdnManager.initialize({
      provider: 'cloudflare',
      zoneId: 'zone-123',
      apiToken: 'token-456',
      domains: ['agentforge.app'],
      enabled: true
    });

    // 加载数据
    loadData();

    // 检测地理位置
    globalRouter.detectGeolocation().then(setGeolocation);

    // 定期更新数据
    const interval = setInterval(loadData, 30000); // 每30秒更新

    return () => {
      clearInterval(interval);
      cdnManager.destroy();
    };
  }, []);

  const loadData = () => {
    const latestStats = cdnManager.getLatestStats();
    if (latestStats) {
      setStats(latestStats);
    }

    const allStats = cdnManager.getStats();
    setHistoricalStats(allStats);

    const nodes = cdnManager.getEdgeNodes();
    setEdgeNodes(nodes);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toString();
  };

  const getNodeStatusColor = (status: string): string => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`cdn-dashboard space-y-6 ${className}`}>
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">CDN & Global Acceleration</h2>
            <p className="text-gray-400 text-sm">Real-time monitoring and analytics</p>
          </div>
        </div>

        {geolocation && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">
              {geolocation.city}, {geolocation.country}
            </span>
          </div>
        )}
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {stats ? `${(stats.hitRate * 100).toFixed(1)}%` : '-'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Cache Hit Rate</h3>
          <p className="text-xs text-gray-500 mt-1">Target: &gt;95%</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {stats ? formatBytes(stats.bandwidth) : '-'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Bandwidth Used</h3>
          <p className="text-xs text-gray-500 mt-1">Last hour</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {stats ? formatNumber(stats.requests) : '-'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Total Requests</h3>
          <p className="text-xs text-gray-500 mt-1">Last hour</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {stats ? formatBytes(stats.cachedBytes) : '-'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Cached Data</h3>
          <p className="text-xs text-gray-500 mt-1">Total size</p>
        </div>
      </div>

      {/* 全球节点地图 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Server className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Global Edge Nodes</h3>
          <span className="text-sm text-gray-400">({edgeNodes.length} nodes)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {edgeNodes.map(node => (
            <div
              key={node.id}
              className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium text-white">{node.location}</span>
                </div>
                <span className={`text-xs ${getNodeStatusColor(node.status)}`}>
                  {node.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Country:</span>
                  <span className="text-gray-300">{node.country}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Latency:</span>
                  <span className="text-gray-300">{node.latency.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Requests:</span>
                  <span className="text-gray-300">{formatNumber(node.requests)}</span>
                </div>
              </div>

              {/* 延迟指示器 */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Response Time</span>
                  <span>{node.latency.toFixed(0)}ms</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      node.latency < 50
                        ? 'bg-green-500'
                        : node.latency < 100
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (node.latency / 200) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 缓存命中率趋势 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Cache Hit Rate Trend</h3>
        </div>

        <div className="h-64 flex items-end justify-between gap-2">
          {historicalStats.length > 0 ? (
            historicalStats.slice(-20).map((stat, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500/30 hover:bg-blue-500/50 transition-colors rounded-t relative group"
                  style={{ height: `${stat.hitRate * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                    {(stat.hitRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              No data available
            </div>
          )}
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-4">
          <span>20 intervals ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => cdnManager.purgeCache()}
            className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium"
          >
            Purge All Cache
          </button>

          <button
            onClick={() => globalRouter.clearCache()}
            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors font-medium"
          >
            Clear Route Cache
          </button>

          <button
            onClick={loadData}
            className="px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors font-medium"
          >
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
};
