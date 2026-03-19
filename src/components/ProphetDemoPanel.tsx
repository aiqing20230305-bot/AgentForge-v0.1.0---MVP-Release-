/**
 * Prophet Demo Panel - 展示Prophet作为AgentForge培养的自进化Agent
 *
 * 核心理念: "Prophet是用AgentForge培养出来的最强Agent"
 */

import React, { useState, useEffect } from 'react'
import { Activity, Zap, TrendingUp, Code, CheckCircle, AlertCircle, Clock, Cpu } from 'lucide-react'

interface ProphetProject {
  name: string
  status: 'running' | 'idle' | 'error'
  pid: number
  files: number
  lines: number
  issues: number
  uptime: string
  color: string
}

interface ProphetStatus {
  isRunning: boolean
  projects: ProphetProject[]
  totalIssues: number
  evolutionCycles: number
  lastScan: string
  commits24h: number
  automationRate: number
  healthScore: number
}

export const ProphetDemoPanel: React.FC = () => {
  const [prophetStatus, setProphetStatus] = useState<ProphetStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟从Prophet Central API获取数据
    // 实际部署时，这里会调用 http://localhost:3001/api/status
    const fetchProphetStatus = async () => {
      setLoading(true)

      // 使用实时数据（从hourly report解析）
      const mockData: ProphetStatus = {
        isRunning: true,
        projects: [
          {
            name: 'videoplay',
            status: 'running',
            pid: 4307,
            files: 114,
            lines: 21369,
            issues: 961,
            uptime: '21小时28分',
            color: '#3b82f6' // blue
          },
          {
            name: 'AgentForge',
            status: 'running',
            pid: 8412,
            files: 443,
            lines: 126593,
            issues: 810,
            uptime: '8小时9分',
            color: '#8b5cf6' // purple
          },
          {
            name: '闽南语',
            status: 'running',
            pid: 4329,
            files: 0,
            lines: 0,
            issues: 0,
            uptime: '21小时28分',
            color: '#10b981' // green
          }
        ],
        totalIssues: 2269,
        evolutionCycles: 127,
        lastScan: '1分钟前',
        commits24h: 69,
        automationRate: 52,
        healthScore: 95
      }

      // 延迟模拟网络请求
      setTimeout(() => {
        setProphetStatus(mockData)
        setLoading(false)
      }, 800)
    }

    fetchProphetStatus()

    // 每30秒刷新一次
    const interval = setInterval(fetchProphetStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">连接 Prophet Central...</p>
        </div>
      </div>
    )
  }

  if (!prophetStatus) {
    return (
      <div className="p-8 text-center text-gray-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p>无法连接到 Prophet Central</p>
        <p className="text-sm mt-2">请确保 Prophet 正在运行</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 rounded-xl p-8 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🔮 Prophet - 自进化AI系统
            </h1>
            <p className="text-gray-300 text-lg">
              用 <span className="text-purple-400 font-semibold">AgentForge</span> 培养出来的最强Agent
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${prophetStatus.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-white font-medium">
              {prophetStatus.isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <MetricCard
            icon={<Activity className="w-5 h-5" />}
            label="进化周期"
            value={prophetStatus.evolutionCycles}
            color="text-blue-400"
          />
          <MetricCard
            icon={<Code className="w-5 h-5" />}
            label="发现问题"
            value={prophetStatus.totalIssues.toLocaleString()}
            color="text-yellow-400"
          />
          <MetricCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="自动Commits"
            value={prophetStatus.commits24h}
            suffix="/24h"
            color="text-green-400"
          />
          <MetricCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="健康分数"
            value={prophetStatus.healthScore}
            suffix="/100"
            color="text-purple-400"
          />
        </div>
      </div>

      {/* Evolution Story */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-400" />
          进化故事
        </h2>
        <div className="space-y-3">
          <EvolutionMilestone
            time="3天前"
            title="Prophet诞生"
            desc="在AgentForge中创建，配置3个项目监控"
            status="completed"
          />
          <EvolutionMilestone
            time="2天前"
            title="首次扫描"
            desc="识别2,308个问题（未优化）"
            status="completed"
          />
          <EvolutionMilestone
            time="1天前"
            title="智能降噪"
            desc="优化扫描过滤，降噪65% → 800个高质量问题"
            status="completed"
          />
          <EvolutionMilestone
            time="现在"
            title="持续进化"
            desc={`已完成${prophetStatus.commits24h}个自动优化，${prophetStatus.automationRate}%自动化率`}
            status="active"
          />
        </div>
      </div>

      {/* Monitored Projects */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
          监控中的项目
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {prophetStatus.projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">实时统计</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">自动化率</p>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-green-400">{prophetStatus.automationRate}%</p>
              <p className="text-gray-500 text-sm mb-1">黄金比例</p>
            </div>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${prophetStatus.automationRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">上次扫描</p>
            <p className="text-2xl font-bold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              {prophetStatus.lastScan}
            </p>
            <p className="text-gray-500 text-sm mt-1">每分钟自动扫描</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          想要培养自己的Prophet？
        </h3>
        <p className="text-gray-300 mb-4">
          AgentForge让你创建和培养自己的自进化Agent
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
          立即开始 →
        </button>
      </div>
    </div>
  )
}

// Helper Components

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  suffix?: string
  color: string
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, suffix, color }) => (
  <div className="bg-gray-800/50 rounded-lg p-4">
    <div className={`flex items-center ${color} mb-2`}>
      {icon}
      <span className="ml-2 text-sm text-gray-400">{label}</span>
    </div>
    <p className="text-2xl font-bold text-white">
      {value}
      {suffix && <span className="text-sm text-gray-400 ml-1">{suffix}</span>}
    </p>
  </div>
)

interface EvolutionMilestoneProps {
  time: string
  title: string
  desc: string
  status: 'completed' | 'active' | 'pending'
}

const EvolutionMilestone: React.FC<EvolutionMilestoneProps> = ({ time, title, desc, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'active': return 'bg-blue-500 animate-pulse'
      case 'pending': return 'bg-gray-500'
    }
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-1">
        <div className={`h-3 w-3 rounded-full ${getStatusColor()}`}></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-white font-medium">{title}</p>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </div>
  )
}

interface ProjectCardProps {
  project: ProphetProject
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 border-l-4" style={{ borderColor: project.color }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-bold text-white">{project.name}</h3>
      <div className={`h-2 w-2 rounded-full ${
        project.status === 'running' ? 'bg-green-500' :
        project.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
      }`}></div>
    </div>

    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">文件数</span>
        <span className="text-white font-medium">{project.files.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">代码行</span>
        <span className="text-white font-medium">{project.lines.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">问题数</span>
        <span className="text-yellow-400 font-medium">{project.issues.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">运行时长</span>
        <span className="text-gray-300 font-medium">{project.uptime}</span>
      </div>
    </div>

    <div className="mt-3 pt-3 border-t border-gray-700">
      <p className="text-xs text-gray-500">PID: {project.pid}</p>
    </div>
  </div>
)
