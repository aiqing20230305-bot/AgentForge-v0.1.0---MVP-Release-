# Shop System - Quick Start Guide

## For Developers

### Adding the Shop to UI

The shop is already integrated into `MainNavigationTabs` as the "商店" tab.

### Awarding Coins

```typescript
import { useShopStore } from '../store/useShopStore'

// Manual coin award
const addCoins = useShopStore(state => state.addCoins)
addCoins(100, 'Custom reward')
```

### Using the Integration Hook

```typescript
import { useShopIntegration } from '../hooks/useShopIntegration'

const {
  awardAchievementCoins,
  awardLevelUpCoins,
  awardTaskCoins,
  awardBattleCoins,
  getActiveBoosts
} = useShopIntegration()

// Award coins on achievement unlock
awardAchievementCoins('first_task') // Reads coin amount from achievement data

// Award coins on level up
awardLevelUpCoins(10) // Awards 100 coins + bonuses

// Award coins on task completion
awardTaskCoins('complex') // Awards 50 coins

// Award coins on battle win
awardBattleCoins('pvp', true) // Awards 50 coins

// Check active boosts
const { speedBoost, expBoost } = getActiveBoosts()
const finalExp = baseExp * expBoost
const taskDuration = baseDuration / speedBoost
```

### Checking Player Resources

```typescript
import { useShopStore } from '../store/useShopStore'

const coins = useShopStore(state => state.coins)
const inventory = useShopStore(state => state.inventory)
const activeEffects = useShopStore(state => state.activeEffects)
```

### Direct Store Access (Outside Components)

```typescript
import { useShopStore } from '../store/useShopStore'

// Get current state
const state = useShopStore.getState()
console.log(state.coins)

// Award coins
state.addCoins(500, 'Special event')

// Purchase item
state.purchaseItem('exp_boost_1h')

// Use item
state.useItem('exp_boost_1h')
```

## For Users

### Earning Coins

1. **Complete Tasks** - 10-50 coins per task
2. **Level Up** - 100+ coins per level
3. **Unlock Achievements** - 100-50000 coins
4. **Win Battles** - 50-100 coins per win
5. **Daily Login** - 100-400 coins (with streak bonus)
6. **Invite Friends** - 500 coins per referral

### Shop Categories

#### Boost Items (Speed)
- Temporary speed multipliers
- 2x or 3x speed
- 1 hour to 24 hours duration

#### Experience Boosts
- Temporary XP multipliers
- 2x or 3x experience
- Stack with other bonuses

#### Skill Point Packs
- Instant skill points
- 1, 3, or 5 points
- No cooldown

#### Cosmetic Items
- Permanent unlocks
- Skins and particle effects
- Show off your style

### Daily Rewards

Click the "每日奖励" button to claim:
- **Base:** 100 coins
- **Streak Bonus:** +50 coins per day (max +300)
- **7-Day Bonus:** Free 24h Exp Boost

### Tips

1. **Save for big items** - Legendary cosmetics cost 10000 coins
2. **Use boosts wisely** - Activate before big task sessions
3. **Check daily limits** - Most boosts have purchase limits
4. **Level up first** - Some items require higher levels
5. **Stack effects** - Speed + Exp boosts work together

### Inventory Management

- **Consumables:** Use from inventory tab
- **Permanents:** Automatically owned once purchased
- **Effects:** View active boosts and timers in effects tab

## Item Reference

### All Shop Items

| Item | Price | Effect | Daily Limit | Level Req |
|------|-------|--------|-------------|-----------|
| Speed Card 1h | 500 | 2x speed, 1h | 5 | - |
| Speed Card 24h | 3000 | 2x speed, 24h | 2 | - |
| Mega Speed Card | 5000 | 3x speed, 1h | 1 | 10 |
| Exp Boost 1h | 400 | 2x exp, 1h | 5 | - |
| Exp Boost 24h | 2500 | 2x exp, 24h | 2 | - |
| Mega Exp Boost | 4000 | 3x exp, 1h | 1 | 15 |
| Skill Pack Small | 1000 | +1 skill point | - | - |
| Skill Pack Medium | 2500 | +3 skill points | - | - |
| Skill Pack Large | 4000 | +5 skill points | - | 20 |
| Golden Skin | 10000 | Cosmetic | - | - |
| Neon Effects | 5000 | Cosmetic | - | 25 |
| Star Particles | 3000 | Cosmetic | - | - |
| Fire Particles | 3000 | Cosmetic | - | - |

## API Reference

### Store Actions

```typescript
// Currency
addCoins(amount: number, reason?: string): void
spendCoins(amount: number, reason?: string): boolean
getCoins(): number

// Shop
purchaseItem(itemId: string, quantity?: number): boolean
getShopItems(): ShopItem[]
canPurchase(item: ShopItem, agentLevel: number): { can: boolean; reason?: string }

// Inventory
useItem(itemId: string): boolean
getInventoryItem(itemId: string): OwnedItem | undefined
getActiveEffects(): ActiveEffect[]

// Daily Rewards
claimDailyReward(): { success: boolean; reward?: { coins: number; item?: ShopItem } }
canClaimDailyReward(): boolean

// Utility
resetDailyLimits(): void
getTransactionHistory(limit?: number): Transaction[]
```

### Types

```typescript
type ItemType = 'consumable' | 'permanent' | 'cosmetic'
type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'
type ItemCategory = 'boost' | 'exp' | 'skill' | 'cosmetic'

interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  type: ItemType
  category: ItemCategory
  rarity: ItemRarity
  price: number
  effect?: {
    type: 'speed' | 'exp' | 'skill_points' | 'cosmetic'
    value: number
    duration?: number
  }
  stock?: number
  dailyLimit?: number
  requirement?: {
    level?: number
    achievement?: string
  }
}
```

## Troubleshooting

### "金币不足"
- Earn more coins through tasks, achievements, or daily login

### "今日购买次数已达上限"
- Wait until next day (resets at midnight)
- Daily limits prevent abuse

### "需要等级 X"
- Level up your agent first
- Some powerful items require higher levels

### "库存不足"
- Currently all items have unlimited stock
- This message shouldn't appear

### Effects not applying
- Check if effect is active in Effects tab
- Effects expire after duration
- Only one effect of each type can be active

## Support

For questions or issues:
1. Check `SHOP_SYSTEM.md` for full documentation
2. Review integration examples in `src/examples/shopIntegrationExample.ts`
3. Open an issue on GitHub
