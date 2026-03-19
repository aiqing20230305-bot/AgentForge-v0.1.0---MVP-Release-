/**
 * Team Panel Component
 * 团队管理面板
 */

import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  Settings,
  MessageSquare,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Shield,
  Target,
  Send,
  Filter,
  Search
} from 'lucide-react'
import { useTeamStore } from '../store/useTeamStore'
import { useDataSourceStore } from '../store/useDataSourceStore'
import type { Team, TeamMember, TeamTask, TeamChatMessage } from '../types/team'

type TabType = 'overview' | 'tasks' | 'members' | 'chat' | 'stats' | 'leaderboard'

export default function TeamPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)

  const {
    teams,
    createTeam,
    disbandTeam,
    addMember,
    removeMember,
    createTeamTask,
    getTeamTasks,
    getTeamMessages,
    sendTeamMessage,
    autoAssignTask,
    updateLeaderboard,
    getTopTeams,
    updateTeamStats
  } = useTeamStore()

  const { agentsCache } = useDataSourceStore()

  const selectedTeam = teams.find(t => t.id === selectedTeamId)

  // 更新排行榜
  useEffect(() => {
    updateLeaderboard()
  }, [teams, updateLeaderboard])

  // 定时更新统计
  useEffect(() => {
    const interval = setInterval(() => {
      teams.forEach(team => updateTeamStats(team.id))
      updateLeaderboard()
    }, 30000) // 每30秒更新一次

    return () => clearInterval(interval)
  }, [teams, updateTeamStats, updateLeaderboard])

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          我的团队
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          创建团队
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>暂无团队，创建一个开始协作吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              onClick={() => {
                setSelectedTeamId(team.id)
                setActiveTab('members')
              }}
              onDisband={() => {
                if (confirm(`确定要解散团队 "${team.name}" 吗？`)) {
                  disbandTeam(team.id)
                  if (selectedTeamId === team.id) {
                    setSelectedTeamId(null)
                  }
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )

  const renderMembers = () => {
    if (!selectedTeam) {
      return <div className="text-center text-slate-400 py-12">请先选择一个团队</div>
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">团队成员</h3>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            添加成员
          </button>
        </div>

        <div className="space-y-2">
          {selectedTeam.members.map(member => (
            <MemberCard
              key={member.agentId}
              member={member}
              isLeader={member.agentId === selectedTeam.leaderId}
              onRemove={() => {
                if (member.agentId === selectedTeam.leaderId) {
                  alert('不能移除队长')
                  return
                }
                if (confirm(`确定要移除成员 "${member.agentName}" 吗？`)) {
                  removeMember(selectedTeam.id, member.agentId)
                }
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  const renderTasks = () => {
    if (!selectedTeam) {
      return <div className="text-center text-slate-400 py-12">请先选择一个团队</div>
    }

    const tasks = getTeamTasks(selectedTeam.id)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">团队任务</h3>
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建任务
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无任务</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                team={selectedTeam}
                onAutoAssign={() => {
                  const result = autoAssignTask(selectedTeam.id, task.id, agentsCache)
                  if (result) {
                    alert(`任务已分配给 ${result.assignedToName}`)
                  } else {
                    alert('没有可用的成员')
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderChat = () => {
    if (!selectedTeam) {
      return <div className="text-center text-slate-400 py-12">请先选择一个团队</div>
    }

    return <TeamChat teamId={selectedTeam.id} />
  }

  const renderStats = () => {
    if (!selectedTeam) {
      return <div className="text-center text-slate-400 py-12">请先选择一个团队</div>
    }

    return <TeamStats team={selectedTeam} />
  }

  const renderLeaderboard = () => {
    const topTeams = getTopTeams(10)

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          团队排行榜
        </h3>

        {topTeams.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无排名数据</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topTeams.map(entry => (
              <LeaderboardCard key={entry.teamId} entry={entry} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-700">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          团队协作系统
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-2 overflow-x-auto">
          <TabButton
            icon={Users}
            label="概览"
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            icon={Shield}
            label="成员"
            active={activeTab === 'members'}
            onClick={() => setActiveTab('members')}
            disabled={!selectedTeam}
          />
          <TabButton
            icon={Target}
            label="任务"
            active={activeTab === 'tasks'}
            onClick={() => setActiveTab('tasks')}
            disabled={!selectedTeam}
          />
          <TabButton
            icon={MessageSquare}
            label="聊天"
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            disabled={!selectedTeam}
          />
          <TabButton
            icon={TrendingUp}
            label="统计"
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
            disabled={!selectedTeam}
          />
          <TabButton
            icon={Trophy}
            label="排行榜"
            active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(name, description) => {
            const firstAgent = agentsCache[0]
            if (!firstAgent) {
              alert('没有可用的 Agent')
              return
            }
            const teamId = createTeam(name, description, firstAgent.id)
            // 添加队长为成员
            addMember(teamId, firstAgent.id, firstAgent.displayName, 'leader')
            setSelectedTeamId(teamId)
            setShowCreateModal(false)
            setActiveTab('members')
          }}
        />
      )}

      {showAddMemberModal && selectedTeam && (
        <AddMemberModal
          team={selectedTeam}
          availableAgents={agentsCache.filter(
            agent => !selectedTeam.members.some(m => m.agentId === agent.id)
          )}
          onClose={() => setShowAddMemberModal(false)}
          onAdd={agentId => {
            const agent = agentsCache.find(a => a.id === agentId)
            if (agent) {
              addMember(selectedTeam.id, agent.id, agent.displayName)
              setShowAddMemberModal(false)
            }
          }}
        />
      )}

      {showCreateTaskModal && selectedTeam && (
        <CreateTaskModal
          teamId={selectedTeam.id}
          onClose={() => setShowCreateTaskModal(false)}
          onCreate={(task: any) => {
            createTeamTask(selectedTeam.id, task)
            setShowCreateTaskModal(false)
          }}
        />
      )}
    </div>
  )
}

// Tab Button Component
function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
  disabled
}: {
  icon: any
  label: string
  active: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
        active
          ? 'bg-blue-500 text-white'
          : disabled
          ? 'text-slate-500 cursor-not-allowed'
          : 'text-slate-300 hover:bg-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

// Team Card Component
function TeamCard({
  team,
  onClick,
  onDisband
}: {
  team: Team
  onClick: () => void
  onDisband: () => void
}) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{team.name}</h4>
          <p className="text-xs text-slate-400 mt-1">{team.description}</p>
        </div>
        <button
          onClick={e => {
            e.stopPropagation()
            onDisband()
          }}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-slate-400">
          <Users className="w-4 h-4" />
          <span>{team.members.length}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Target className="w-4 h-4" />
          <span>{team.stats.totalTasks}</span>
        </div>
        <div className="flex items-center gap-1 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span>{team.stats.completedTasks}</span>
        </div>
      </div>

      <div
        className={`mt-2 inline-block px-2 py-1 rounded text-xs ${
          team.status === 'active'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-slate-700 text-slate-400'
        }`}
      >
        {team.status === 'active' ? '活跃' : '未活跃'}
      </div>
    </div>
  )
}

// Member Card Component
function MemberCard({
  member,
  isLeader,
  onRemove
}: {
  member: TeamMember
  isLeader: boolean
  onRemove: () => void
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {member.agentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{member.agentName}</h4>
              {isLeader && <Crown className="w-4 h-4 text-yellow-400" />}
            </div>
            <p className="text-xs text-slate-400">{member.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="text-green-400">{member.stats.tasksCompleted} 完成</div>
            <div className="text-blue-400">{member.stats.tasksInProgress} 进行中</div>
            <div className="text-red-400">{member.stats.tasksFailed} 失败</div>
          </div>

          {!isLeader && (
            <button
              onClick={onRemove}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <UserMinus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Task Card Component
function TaskCard({
  task,
  team,
  onAutoAssign
}: {
  task: TeamTask
  team: Team
  onAutoAssign: () => void
}) {
  const assignedMember = team.members.find(m => m.agentId === task.assignedTo)

  const statusConfig = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle, label: '待处理' },
    assigned: { color: 'bg-blue-500/20 text-blue-400', icon: Clock, label: '已分配' },
    in_progress: { color: 'bg-purple-500/20 text-purple-400', icon: Clock, label: '进行中' },
    completed: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, label: '已完成' },
    failed: { color: 'bg-red-500/20 text-red-400', icon: XCircle, label: '失败' }
  }

  const config = statusConfig[task.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-white">{task.title}</h4>
          <p className="text-sm text-slate-400 mt-1">{task.description}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${config.color}`}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-4 text-sm">
          {assignedMember ? (
            <span className="text-slate-400">分配给: {assignedMember.agentName}</span>
          ) : (
            <button
              onClick={onAutoAssign}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-xs transition-colors"
            >
              自动分配
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          {task.priority && (
            <span
              className={`px-2 py-1 rounded ${
                task.priority === 'urgent'
                  ? 'bg-red-500/20 text-red-400'
                  : task.priority === 'high'
                  ? 'bg-orange-500/20 text-orange-400'
                  : task.priority === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {task.priority}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Team Chat Component
function TeamChat({ teamId }: { teamId: string }) {
  const [message, setMessage] = useState('')
  const { getTeamMessages, sendTeamMessage } = useTeamStore()
  const { agentsCache } = useDataSourceStore()
  const messages = getTeamMessages(teamId)

  const handleSend = () => {
    if (!message.trim()) return

    // 使用第一个 agent 发送消息（演示）
    const firstAgent = agentsCache[0]
    if (firstAgent) {
      sendTeamMessage(teamId, firstAgent.id, firstAgent.displayName, message.trim())
      setMessage('')
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-slate-800 rounded-lg border border-slate-700">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Chat Message Component
function ChatMessage({ message }: { message: TeamChatMessage }) {
  const isSystem = message.type === 'system'

  if (isSystem) {
    return (
      <div className="text-center text-xs text-slate-500 py-1">
        {message.content}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
        {message.senderName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-white text-sm">{message.senderName}</span>
          <span className="text-xs text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-slate-300 text-sm mt-1">{message.content}</p>
      </div>
    </div>
  )
}

// Team Stats Component
function TeamStats({ team }: { team: Team }) {
  const successRate =
    team.stats.totalTasks > 0 ? (team.stats.completedTasks / team.stats.totalTasks) * 100 : 0

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">团队统计</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="总任务"
          value={team.stats.totalTasks}
          color="text-blue-400"
        />
        <StatCard
          icon={CheckCircle}
          label="已完成"
          value={team.stats.completedTasks}
          color="text-green-400"
        />
        <StatCard
          icon={Clock}
          label="进行中"
          value={team.stats.inProgressTasks}
          color="text-purple-400"
        />
        <StatCard
          icon={XCircle}
          label="失败"
          value={team.stats.failedTasks}
          color="text-red-400"
        />
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-white mb-3">成功率</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${successRate}%` }}
            />
          </div>
          <span className="text-green-400 font-semibold">{successRate.toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-2">平均完成时间</h4>
          <p className="text-2xl font-bold text-blue-400">
            {(team.stats.averageTaskTime / 60).toFixed(1)} 分钟
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-2">总贡献度</h4>
          <p className="text-2xl font-bold text-purple-400">{team.stats.totalContribution}</p>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: any
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <h4 className="text-sm text-slate-400">{label}</h4>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

// Leaderboard Card Component
function LeaderboardCard({ entry }: { entry: any }) {
  const medalColors = {
    1: 'text-yellow-400',
    2: 'text-slate-300',
    3: 'text-orange-400'
  }

  const medalColor = medalColors[entry.rank as keyof typeof medalColors] || 'text-slate-500'

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center gap-4">
      <div className={`text-2xl font-bold ${medalColor} w-8 text-center`}>
        {entry.rank <= 3 ? <Trophy className="w-6 h-6 mx-auto" /> : entry.rank}
      </div>

      <div className="flex-1">
        <h4 className="font-semibold text-white">{entry.teamName}</h4>
        <p className="text-xs text-slate-400">队长: {entry.leaderName}</p>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-blue-400">{entry.totalPoints.toFixed(0)}</div>
        <div className="text-xs text-slate-400">
          {entry.completedTasks}/{entry.totalTasks} 任务
        </div>
      </div>
    </div>
  )
}

// Create Team Modal
function CreateTeamModal({
  onClose,
  onCreate
}: {
  onClose: () => void
  onCreate: (name: string, description: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = () => {
    if (!name.trim()) {
      alert('请输入团队名称')
      return
    }
    onCreate(name.trim(), description.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">创建团队</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">团队名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入团队名称"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">团队描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="输入团队描述"
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
          >
            创建
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

// Add Member Modal
function AddMemberModal({
  team,
  availableAgents,
  onClose,
  onAdd
}: {
  team: Team
  availableAgents: any[]
  onClose: () => void
  onAdd: (agentId: string) => void
}) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">添加成员</h3>

        {availableAgents.length === 0 ? (
          <p className="text-slate-400 text-center py-4">没有可添加的 Agent</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {availableAgents.map(agent => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAgentId === agent.id
                    ? 'bg-blue-500/20 border-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {agent.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{agent.displayName}</h4>
                    <p className="text-xs text-slate-400">{agent.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => {
              if (selectedAgentId) {
                onAdd(selectedAgentId)
              }
            }}
            disabled={!selectedAgentId}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

// Create Task Modal
function CreateTaskModal({
  teamId,
  onClose,
  onCreate
}: {
  teamId: string
  onClose: () => void
  onCreate: (task: any) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const { agentsCache } = useDataSourceStore()

  const handleCreate = () => {
    if (!title.trim()) {
      alert('请输入任务标题')
      return
    }

    const firstAgent = agentsCache[0]
    if (!firstAgent) {
      alert('没有可用的 Agent')
      return
    }

    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      createdBy: firstAgent.id
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">创建任务</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">任务标题</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="输入任务标题"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">任务描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="输入任务描述"
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">优先级</label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    priority === p
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleCreate}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
          >
            创建
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
