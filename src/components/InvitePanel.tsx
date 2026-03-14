/**
 * 邀请码面板
 * 管理邀请码生成、使用、统计和排行榜
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Copy, Check, UserPlus, Trophy, TrendingUp, Award, Coins, Zap, X, QrCode } from 'lucide-react'
import { useInviteStore } from '../store/useInviteStore'
import { useDataSourceStore } from '../store/useDataSourceStore'
import { useInstantFeedback } from '../hooks/useInstantFeedback'
import { audioSystem } from '../services/audioSystem'
import { InviteQRModal } from './InviteQRModal'

export const InvitePanel: React.FC = () => {
  const feedback = useInstantFeedback()

  const {
    inviteCodes,
    inviteStats,
    inviteLeaderboard,
    rewardConfig,
    createInviteCode,
    useInviteCode: redeemInviteCode,
    getAgentInviteCodes,
    getAgentInviteStats
  } = useInviteStore()

  const { agentsCache, addAgentExp, addAgentCoins } = useDataSourceStore()

  const [inputCode, setInputCode] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'my-codes' | 'use-code' | 'leaderboard'>('my-codes')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [selectedExpiry, setSelectedExpiry] = useState<string>('')

  // 当前Agent（演示用第一个）
  const myAgent = agentsCache[0] || { id: 'demo-agent-001', name: '演示Agent' }
  const myInviteCodes = getAgentInviteCodes(myAgent.id)
  const myStats = getAgentInviteStats(myAgent.id)

  // 生成新邀请码
  const handleCreateCode = (e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')

    const code = createInviteCode(myAgent.id, myAgent.name, 30) // 30天有效期
    audioSystem.play('achievement')

    // 复制到剪贴板
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // 复制邀请码
  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')

    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
    audioSystem.play('success')
  }

  // 显示二维码
  const handleShowQR = (code: string, expiresAt: string, e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')

    setSelectedCode(code)
    setSelectedExpiry(new Date(expiresAt).toLocaleDateString('zh-CN'))
    setQrModalOpen(true)
  }

  // 计算剩余天数
  const getDaysRemaining = (expiresAt: string): number => {
    const now = new Date().getTime()
    const expiry = new Date(expiresAt).getTime()
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    return daysLeft
  }

  // 获取过期警告状态
  const getExpiryWarning = (daysLeft: number): { level: 'none' | 'warning' | 'urgent'; message: string } => {
    if (daysLeft <= 0) {
      return { level: 'none', message: '' }
    } else if (daysLeft <= 3) {
      return { level: 'urgent', message: `⚠️ ${daysLeft}天后过期` }
    } else if (daysLeft <= 7) {
      return { level: 'warning', message: `⏰ ${daysLeft}天后过期` }
    }
    return { level: 'none', message: `${daysLeft}天后过期` }
  }

  // 使用邀请码
  const handleUseCode = (e: React.MouseEvent) => {
    feedback.onClick(e)
    audioSystem.play('click')

    if (!inputCode.trim()) {
      alert('❌ 请输入邀请码')
      return
    }

    const result = redeemInviteCode(inputCode.trim().toUpperCase(), myAgent.id, myAgent.name)

    if (result.success && result.rewards) {
      // 发放奖励
      addAgentExp(myAgent.id, result.rewards.inviteeExp)
      addAgentCoins(myAgent.id, result.rewards.inviteeCoins)

      // 发放邀请者奖励
      const inviteCode = inviteCodes.find(c => c.code === inputCode.trim().toUpperCase())
      if (inviteCode) {
        addAgentExp(inviteCode.creatorId, result.rewards.inviterExp)
        addAgentCoins(inviteCode.creatorId, result.rewards.inviterCoins)
      }

      audioSystem.playSequence([
        { type: 'success', delay: 0 },
        { type: 'coin', delay: 200 },
        { type: 'exp_gain', delay: 400 }
      ])
      alert(`✅ ${result.message}\n\n🎁 你获得了：\n  +${result.rewards.inviteeExp} 经验\n  +${result.rewards.inviteeCoins} 金币`)
      setInputCode('')
    } else {
      audioSystem.play('error')
      alert(`❌ ${result.message}`)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 头部 */}
      <div className="flex-shrink-0 p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-8 h-8 text-pink-400" />
          <div>
            <h2 className="text-2xl font-black text-white">邀请好友</h2>
            <p className="text-sm text-gray-400">邀请好友，双方获得丰厚奖励</p>
          </div>
        </div>

        {/* 奖励配置显示 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-700/50">
            <div className="text-xs text-purple-300 mb-1">邀请者奖励</div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white">+{rewardConfig.inviterReward.exp} EXP</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white">+{rewardConfig.inviterReward.coins} 金币</span>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-lg border border-cyan-700/50">
            <div className="text-xs text-cyan-300 mb-1">新用户奖励</div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white">+{rewardConfig.inviteeReward.exp} EXP</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-white">+{rewardConfig.inviteeReward.coins} 金币</span>
            </div>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'my-codes' as const, label: '我的邀请码', icon: Gift },
            { id: 'use-code' as const, label: '使用邀请码', icon: UserPlus },
            { id: 'leaderboard' as const, label: '邀请排行', icon: Trophy }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  audioSystem.play('click')
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 我的邀请码 */}
        {activeTab === 'my-codes' && (
          <div className="space-y-4">
            {/* 统计卡片 */}
            {myStats && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <div className="text-2xl font-black text-cyan-400">{myStats.successfulInvites}</div>
                  <div className="text-xs text-gray-400 mt-1">成功邀请</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <div className="text-2xl font-black text-yellow-400">{myStats.totalExpEarned}</div>
                  <div className="text-xs text-gray-400 mt-1">总获得经验</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                  <div className="text-2xl font-black text-orange-400">{myStats.totalCoinsEarned}</div>
                  <div className="text-xs text-gray-400 mt-1">总获得金币</div>
                </div>
              </div>
            )}

            {/* 生成新邀请码按钮 */}
            <button
              onClick={handleCreateCode}
              className="w-full p-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-xl font-black text-white transition-all shadow-lg feedback-button-glow feedback-button-scale"
            >
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-5 h-5" />
                <span>生成新邀请码</span>
              </div>
            </button>

            {/* 邀请码列表 */}
            {myInviteCodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-bold">暂无邀请码</div>
                <div className="text-sm mt-2">点击上方按钮生成你的第一个邀请码</div>
              </div>
            ) : (
              <div className="space-y-3">
                {myInviteCodes.map(code => {
                  const daysLeft = getDaysRemaining(code.expiresAt)
                  const warning = getExpiryWarning(daysLeft)

                  return (
                  <motion.div
                    key={code.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-2 ${
                      code.status === 'used'
                        ? 'bg-green-900/20 border-green-700/50'
                        : code.status === 'expired'
                        ? 'bg-gray-900/50 border-gray-700/50'
                        : 'bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-pink-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-mono font-black text-white tracking-wider">
                            {code.code}
                          </span>
                          {code.status === 'used' && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                              已使用
                            </span>
                          )}
                          {code.status === 'expired' && (
                            <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs font-bold rounded-full">
                              已过期
                            </span>
                          )}
                          {code.status === 'active' && (
                            <>
                              <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs font-bold rounded-full">
                                有效
                              </span>
                              {warning.level === 'urgent' && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full animate-pulse">
                                  即将过期
                                </span>
                              )}
                              {warning.level === 'warning' && (
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full">
                                  临近过期
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          创建于 {new Date(code.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                        {code.status === 'active' && warning.message && (
                          <div className={`text-xs mt-1 font-medium ${
                            warning.level === 'urgent'
                              ? 'text-red-400'
                              : warning.level === 'warning'
                              ? 'text-yellow-400'
                              : 'text-gray-500'
                          }`}>
                            {warning.message}
                          </div>
                        )}
                        {code.usedBy && (
                          <div className="text-xs text-green-400 mt-1">
                            ✅ 被 {code.usedByName} 使用
                          </div>
                        )}
                      </div>

                      {code.status === 'active' && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleShowQR(code.code, code.expiresAt, e)}
                            className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all feedback-button-scale"
                            title="显示二维码"
                          >
                            <QrCode className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={(e) => handleCopyCode(code.code, e)}
                            className="p-3 bg-pink-600 hover:bg-pink-500 rounded-lg transition-all feedback-button-scale"
                            title="复制邀请码"
                          >
                            {copiedCode === code.code ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <Copy className="w-5 h-5 text-white" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 使用邀请码 */}
        {activeTab === 'use-code' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">输入邀请码</h3>
              <p className="text-sm text-gray-400">使用好友的邀请码获得新手奖励</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">邀请码（8位）</label>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  placeholder="例如: ABC12345"
                  className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-lg text-white text-center text-2xl font-mono font-bold tracking-widest focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleUseCode}
                className="w-full p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-black text-white transition-all shadow-lg feedback-button-glow feedback-button-scale"
              >
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>使用邀请码</span>
                </div>
              </button>
            </div>

            {/* 奖励提示 */}
            <div className="p-4 bg-cyan-900/30 border border-cyan-700/50 rounded-lg">
              <div className="text-sm font-bold text-cyan-300 mb-2">🎁 你将获得：</div>
              <div className="space-y-1 text-sm text-white">
                <div>• +{rewardConfig.inviteeReward.exp} 经验值</div>
                <div>• +{rewardConfig.inviteeReward.coins} 金币</div>
              </div>
            </div>
          </div>
        )}

        {/* 邀请排行榜 */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            {inviteLeaderboard.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-bold">暂无排行榜数据</div>
                <div className="text-sm mt-2">成功邀请好友后将显示在排行榜</div>
              </div>
            ) : (
              inviteLeaderboard.map((stats, index) => {
                const isTop3 = index < 3
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null

                return (
                  <motion.div
                    key={stats.agentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg ${
                      isTop3
                        ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600/50'
                        : 'bg-slate-800/50 border border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-black text-gray-400 w-8 text-center">
                        {medal || `#${stats.inviteRank}`}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{stats.agentName}</div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <UserPlus className="w-3 h-3" />
                            {stats.successfulInvites} 次邀请
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            {stats.totalExpEarned} 经验
                          </span>
                        </div>
                      </div>
                      {isTop3 && (
                        <Award className="w-6 h-6 text-yellow-400" />
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700">
        <div className="text-center text-xs text-gray-500">
          💡 提示：每个邀请码只能使用一次 • 邀请码有效期30天
        </div>
      </div>

      {/* QR码模态框 */}
      <InviteQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        inviteCode={selectedCode}
        expiryDate={selectedExpiry}
      />
    </div>
  )
}
