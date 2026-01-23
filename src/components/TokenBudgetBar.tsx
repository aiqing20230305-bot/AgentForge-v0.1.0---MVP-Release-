import { useBuildStore } from '../stores/buildStore'
import { formatTokens, getTokenBudgetStatus } from '../utils/tokenizer'

export default function TokenBudgetBar() {
  const { getTotalTokens, settings } = useBuildStore()
  const currentTokens = getTotalTokens()
  const maxTokens = settings.maxTokenBudget
  const percentage = Math.min((currentTokens / maxTokens) * 100, 100)
  const status = getTokenBudgetStatus(currentTokens, maxTokens)

  const barColors = {
    safe: 'bg-gradient-to-r from-green-600 to-green-500',
    warning: 'bg-gradient-to-r from-yellow-600 to-yellow-500',
    danger: 'bg-gradient-to-r from-red-600 to-red-500'
  }

  return (
    <div className="w-full">
      {/* Label */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-amber-100/60 uppercase tracking-wider">Token Budget</span>
        <span className={`text-xs font-bold ${
          status === 'danger' ? 'text-red-400' :
          status === 'warning' ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {formatTokens(currentTokens)} / {formatTokens(maxTokens)}
        </span>
      </div>

      {/* WoW-style bar */}
      <div className="h-4 bg-[#0a0a0a] rounded border-2 border-[#4a4a4a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden">
        <div
          className={`h-full ${barColors[status]} transition-all duration-300 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* Warning text */}
      {status === 'danger' && (
        <div className="mt-1 text-[10px] text-red-400 text-center animate-pulse">
          ⚠️ Over budget!
        </div>
      )}
    </div>
  )
}
