/**
 * Battle System Types
 * PvP combat system definitions
 */

export type BattleType = 'pvp' | 'pve' | 'ranked'
export type BattleStatus = 'waiting' | 'in_progress' | 'finished'

export interface BattleSkill {
  id: string
  name: string
  description: string
  damage: number
  cooldown: number
  currentCooldown?: number
  cooldownRemaining?: number
}

export interface StatusEffect {
  id: string
  name: string
  type: 'buff' | 'debuff'
  stat: 'attack' | 'defense' | 'speed'
  value: number
  duration: number
}

export interface BattleAgent {
  agentId: string
  name: string
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  battleSkills: BattleSkill[]
  buffs: StatusEffect[]
  debuffs: StatusEffect[]
}

export interface BattleAction {
  type: 'attack' | 'skill' | 'defend'
  skillId?: string
  targetId?: string
}

export interface BattleLogEntry {
  id: string
  timestamp: string
  message: string
  action: 'attack' | 'skill' | 'defend' | 'heal' | 'damage' | 'crit' | 'miss' | 'death' | 'victory' | 'defeat' | 'turn_start' | 'system'
  type?: 'damage' | 'heal' | 'buff' | 'debuff' | 'critical' | 'miss' | 'info'
  value?: number
  attacker?: string
  target?: string
  damage?: number
  heal?: number
}

export interface BattleRewards {
  exp: number
  coins: number
  rankPoints?: number
  items?: string[]
}

export interface Battle {
  id: string
  type: BattleType
  player1: BattleAgent
  player2: BattleAgent
  currentTurn: number
  currentPlayer: 1 | 2
  battleLog: BattleLogEntry[]
  status: BattleStatus
  winner?: 1 | 2
  rewards?: BattleRewards
  createdAt: string
  finishedAt?: string
}
