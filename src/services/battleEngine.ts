/**
 * Battle Engine
 * Turn-based combat system for Agent PvP
 */

import type { AgentData } from '../store/useDataSourceStore'
import type { Battle, BattleAgent, BattleAction, BattleLogEntry, BattleRewards, BattleSkill } from '../types/battle'

export class BattleEngine {
  /**
   * Initialize a new battle between two agents
   */
  static initBattle(agent1: AgentData, agent2: AgentData, type: 'pvp' | 'pve' | 'ranked' = 'pvp'): Battle {
    const player1 = this.createBattleAgent(agent1)
    const player2 = this.createBattleAgent(agent2)

    // Determine first player based on speed
    const firstPlayer = player1.speed >= player2.speed ? 1 : 2

    return {
      id: `battle_${Date.now()}`,
      type,
      player1,
      player2,
      currentTurn: 1,
      currentPlayer: firstPlayer as 1 | 2,
      battleLog: [
        {
          timestamp: new Date().toISOString(),
          message: `战斗开始！${player1.name} vs ${player2.name}`,
          type: 'info'
        },
        {
          timestamp: new Date().toISOString(),
          message: `${firstPlayer === 1 ? player1.name : player2.name} 获得先手！`,
          type: 'info'
        }
      ],
      status: 'in_progress',
      createdAt: new Date().toISOString()
    }
  }

  /**
   * Create battle agent from agent data
   */
  private static createBattleAgent(agent: AgentData): BattleAgent {
    const level = agent.levelSystem?.currentLevel || agent.level || 1

    return {
      agentId: agent.id,
      name: agent.name,
      level,
      hp: level * 100,
      maxHp: level * 100,
      attack: level * 5,
      defense: level * 3,
      speed: level * 2,
      battleSkills: this.generateDefaultSkills(),
      buffs: [],
      debuffs: []
    }
  }

  /**
   * Generate default battle skills
   */
  private static generateDefaultSkills(): BattleSkill[] {
    return [
      {
        id: 'basic_attack',
        name: '普通攻击',
        description: '造成100%攻击力的伤害',
        damage: 1.0,
        cooldown: 0,
        currentCooldown: 0
      },
      {
        id: 'power_strike',
        name: '强力打击',
        description: '造成150%攻击力的伤害',
        damage: 1.5,
        cooldown: 2,
        currentCooldown: 0
      },
      {
        id: 'critical_hit',
        name: '暴击',
        description: '造成200%攻击力的伤害',
        damage: 2.0,
        cooldown: 3,
        currentCooldown: 0
      },
      {
        id: 'ultimate',
        name: '终极技能',
        description: '造成300%攻击力的伤害',
        damage: 3.0,
        cooldown: 5,
        currentCooldown: 0
      }
    ]
  }

  /**
   * Execute a turn action
   */
  static executeTurn(battle: Battle, action: BattleAction): Battle {
    const attacker = battle.currentPlayer === 1 ? battle.player1 : battle.player2
    const defender = battle.currentPlayer === 1 ? battle.player2 : battle.player1

    const log: BattleLogEntry[] = []

    if (action.type === 'attack') {
      const damage = this.calculateDamage(attacker, defender)
      defender.hp = Math.max(0, defender.hp - damage)

      log.push({
        timestamp: new Date().toISOString(),
        message: `${attacker.name} 对 ${defender.name} 造成了 ${damage} 点伤害！`,
        type: 'damage',
        value: damage
      })
    } else if (action.type === 'skill' && action.skillId) {
      const skill = attacker.battleSkills.find(s => s.id === action.skillId)

      if (skill && skill.currentCooldown === 0) {
        const damage = Math.round(attacker.attack * skill.damage - defender.defense * 0.3)
        const actualDamage = Math.max(1, damage)
        defender.hp = Math.max(0, defender.hp - actualDamage)

        // Set cooldown
        skill.currentCooldown = skill.cooldown

        log.push({
          timestamp: new Date().toISOString(),
          message: `${attacker.name} 使用 ${skill.name}，造成 ${actualDamage} 点伤害！`,
          type: 'damage',
          value: actualDamage
        })
      }
    }

    // Reduce cooldowns
    attacker.battleSkills.forEach(skill => {
      if (skill.currentCooldown > 0) skill.currentCooldown--
    })

    // Check if battle is over
    const winner = defender.hp <= 0 ? battle.currentPlayer : undefined

    // Update battle
    const updatedBattle: Battle = {
      ...battle,
      player1: battle.currentPlayer === 1 ? attacker : defender,
      player2: battle.currentPlayer === 2 ? attacker : defender,
      currentTurn: battle.currentTurn + 1,
      currentPlayer: battle.currentPlayer === 1 ? 2 : 1,
      battleLog: [...battle.battleLog, ...log],
      status: winner ? 'finished' : 'in_progress',
      winner,
      finishedAt: winner ? new Date().toISOString() : undefined
    }

    if (winner) {
      updatedBattle.rewards = this.calculateRewards(battle, winner)
      updatedBattle.battleLog.push({
        timestamp: new Date().toISOString(),
        message: `${winner === 1 ? battle.player1.name : battle.player2.name} 获胜！`,
        type: 'info'
      })
    }

    return updatedBattle
  }

  /**
   * Calculate damage
   */
  private static calculateDamage(attacker: BattleAgent, defender: BattleAgent): number {
    const baseDamage = attacker.attack - defender.defense * 0.5
    const variance = 0.1 // ±10% variance
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variance
    const damage = Math.round(baseDamage * randomFactor)

    // Critical hit chance (10%)
    const isCritical = Math.random() < 0.1
    return Math.max(1, isCritical ? damage * 2 : damage)
  }

  /**
   * AI decision making
   */
  static makeAIDecision(battle: Battle): BattleAction {
    const agent = battle.currentPlayer === 1 ? battle.player1 : battle.player2

    // Use best available skill
    const availableSkills = agent.battleSkills
      .filter(s => s.currentCooldown === 0)
      .sort((a, b) => b.damage - a.damage)

    if (availableSkills.length > 1) {
      return {
        type: 'skill',
        skillId: availableSkills[0].id
      }
    }

    return { type: 'attack' }
  }

  /**
   * Calculate battle rewards
   */
  private static calculateRewards(battle: Battle, winner: 1 | 2): BattleRewards {
    const winnerAgent = winner === 1 ? battle.player1 : battle.player2
    const loserAgent = winner === 1 ? battle.player2 : battle.player1

    const baseExp = 500
    const levelDiff = loserAgent.level - winnerAgent.level
    const expBonus = Math.max(0, levelDiff * 50)

    const baseCoins = 100
    const coinBonus = Math.max(0, levelDiff * 20)

    return {
      exp: baseExp + expBonus,
      coins: baseCoins + coinBonus,
      rankPoints: battle.type === 'ranked' ? 25 : undefined
    }
  }
}
