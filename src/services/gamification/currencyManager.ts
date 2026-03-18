/**
 * 货币管理器 - Currency Manager
 *
 * 负责：
 * - 虚拟货币管理（coins、gems、tokens）
 * - 货币交易
 * - 每日奖励
 * - 交易历史记录
 */

import type { Currency, CurrencyType, CurrencyTransaction, EconomySystem } from './types';

/**
 * 货币管理器类
 */
export class CurrencyManager implements EconomySystem {
  private balance: Currency = {
    coins: 0,
    gems: 0,
    tokens: 0,
  };

  private transactions: CurrencyTransaction[] = [];
  private lastDailyBonus: Date | null = null;

  // 货币兑换汇率
  private exchangeRates = {
    coins_to_gems: 100, // 100 coins = 1 gem
    gems_to_coins: 80, // 1 gem = 80 coins (有损耗)
    tokens_to_coins: 50, // 1 token = 50 coins
    tokens_to_gems: 1, // 2 tokens = 1 gem
  };

  constructor(initialBalance?: Partial<Currency>) {
    if (initialBalance) {
      this.balance = { ...this.balance, ...initialBalance };
    }
  }

  /**
   * 获得货币
   */
  async earnCurrency(type: CurrencyType, amount: number, reason: string): Promise<Currency> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // 更新余额
    this.balance[type] += amount;

    // 记录交易
    this.recordTransaction({
      type: 'earn',
      currencyType: type,
      amount,
      reason,
    });

    console.log(`💰 Earned: +${amount} ${type} (${reason})`);
    console.log(`💵 New Balance: ${this.balance[type]} ${type}`);

    return { ...this.balance };
  }

  /**
   * 消费货币
   */
  async spendCurrency(type: CurrencyType, amount: number, reason: string): Promise<boolean> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // 检查余额是否足够
    if (this.balance[type] < amount) {
      console.warn(`❌ Insufficient balance: need ${amount} ${type}, have ${this.balance[type]}`);
      return false;
    }

    // 扣除余额
    this.balance[type] -= amount;

    // 记录交易
    this.recordTransaction({
      type: 'spend',
      currencyType: type,
      amount: -amount,
      reason,
    });

    console.log(`💸 Spent: -${amount} ${type} (${reason})`);
    console.log(`💵 New Balance: ${this.balance[type]} ${type}`);

    return true;
  }

  /**
   * 兑换货币
   */
  async exchangeCurrency(from: CurrencyType, to: CurrencyType, amount: number): Promise<Currency> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // 检查余额
    if (this.balance[from] < amount) {
      throw new Error(`Insufficient ${from}: need ${amount}, have ${this.balance[from]}`);
    }

    // 计算兑换后的金额
    const exchanged = this.calculateExchange(from, to, amount);

    if (exchanged <= 0) {
      throw new Error(`Invalid exchange: ${from} to ${to}`);
    }

    // 执行兑换
    this.balance[from] -= amount;
    this.balance[to] += exchanged;

    // 记录交易
    this.recordTransaction({
      type: 'exchange',
      currencyType: from,
      amount: -amount,
      reason: `Exchange to ${to}`,
      metadata: {
        fromCurrency: from,
        toCurrency: to,
        fromAmount: amount,
        toAmount: exchanged,
      },
    });

    console.log(`🔄 Exchanged: ${amount} ${from} → ${exchanged} ${to}`);
    console.log(`💵 Balance: ${this.balance[from]} ${from}, ${this.balance[to]} ${to}`);

    return { ...this.balance };
  }

  /**
   * 计算兑换金额
   */
  private calculateExchange(from: CurrencyType, to: CurrencyType, amount: number): number {
    if (from === to) {
      return amount;
    }

    const rateKey = `${from}_to_${to}` as keyof typeof this.exchangeRates;
    const rate = this.exchangeRates[rateKey];

    if (!rate) {
      // 尝试反向兑换
      const reverseKey = `${to}_to_${from}` as keyof typeof this.exchangeRates;
      const reverseRate = this.exchangeRates[reverseKey];

      if (reverseRate) {
        // 使用反向汇率计算
        return Math.floor(amount / reverseRate);
      }

      return 0;
    }

    // coins to gems: 100 coins = 1 gem
    // amount / rate = result
    if (from === 'coins' && to === 'gems') {
      return Math.floor(amount / rate);
    }

    // gems to coins: 1 gem = 80 coins
    // amount * rate = result
    if (from === 'gems' && to === 'coins') {
      return Math.floor(amount * rate);
    }

    // tokens to coins: 1 token = 50 coins
    if (from === 'tokens' && to === 'coins') {
      return Math.floor(amount * rate);
    }

    // tokens to gems: 2 tokens = 1 gem
    if (from === 'tokens' && to === 'gems') {
      return Math.floor(amount / 2);
    }

    return 0;
  }

  /**
   * 获取每日奖励
   */
  async getDailyBonus(): Promise<Currency> {
    const now = new Date();

    // 检查是否已经领取今日奖励
    if (this.lastDailyBonus) {
      const lastDate = this.lastDailyBonus.toDateString();
      const todayDate = now.toDateString();

      if (lastDate === todayDate) {
        throw new Error('Daily bonus already claimed today');
      }
    }

    // 每日奖励数量
    const dailyBonus: Currency = {
      coins: 500,
      gems: 5,
      tokens: 2,
    };

    // 发放奖励
    this.balance.coins += dailyBonus.coins;
    this.balance.gems += dailyBonus.gems;
    this.balance.tokens += dailyBonus.tokens;

    // 更新最后领取时间
    this.lastDailyBonus = now;

    // 记录交易
    this.recordTransaction({
      type: 'earn',
      currencyType: 'coins',
      amount: dailyBonus.coins,
      reason: 'Daily Bonus',
    });

    console.log('🎁 Daily Bonus Claimed!');
    console.log(`💰 Received: ${dailyBonus.coins} coins, ${dailyBonus.gems} gems, ${dailyBonus.tokens} tokens`);

    return { ...this.balance };
  }

  /**
   * 检查是否可以领取每日奖励
   */
  canClaimDailyBonus(): boolean {
    if (!this.lastDailyBonus) {
      return true;
    }

    const lastDate = this.lastDailyBonus.toDateString();
    const todayDate = new Date().toDateString();

    return lastDate !== todayDate;
  }

  /**
   * 获取距离下次每日奖励的时间（秒）
   */
  getTimeUntilNextDailyBonus(): number {
    if (this.canClaimDailyBonus()) {
      return 0;
    }

    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
  }

  /**
   * 获取货币余额
   */
  async getBalance(): Promise<Currency> {
    return { ...this.balance };
  }

  /**
   * 获取特定货币余额
   */
  getBalanceOf(type: CurrencyType): number {
    return this.balance[type];
  }

  /**
   * 记录交易
   */
  private recordTransaction(partial: Omit<CurrencyTransaction, 'id' | 'userId' | 'balance' | 'createdAt'>): void {
    const transaction: CurrencyTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current_user', // 实际应从认证系统获取
      ...partial,
      balance: { ...this.balance },
      createdAt: new Date(),
    };

    this.transactions.push(transaction);

    // 限制历史记录数量（保留最近1000条）
    if (this.transactions.length > 1000) {
      this.transactions = this.transactions.slice(-1000);
    }
  }

  /**
   * 获取交易历史
   */
  async getTransactions(limit: number = 50): Promise<CurrencyTransaction[]> {
    return this.transactions.slice(-limit).reverse();
  }

  /**
   * 获取特定类型的交易历史
   */
  getTransactionsByType(type: 'earn' | 'spend' | 'exchange', limit: number = 50): CurrencyTransaction[] {
    return this.transactions.filter((tx) => tx.type === type).slice(-limit).reverse();
  }

  /**
   * 获取特定货币的交易历史
   */
  getTransactionsByCurrency(currencyType: CurrencyType, limit: number = 50): CurrencyTransaction[] {
    return this.transactions.filter((tx) => tx.currencyType === currencyType).slice(-limit).reverse();
  }

  /**
   * 计算总收入
   */
  getTotalEarned(currencyType: CurrencyType): number {
    return this.transactions
      .filter((tx) => tx.type === 'earn' && tx.currencyType === currencyType)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  /**
   * 计算总支出
   */
  getTotalSpent(currencyType: CurrencyType): number {
    return Math.abs(
      this.transactions
        .filter((tx) => tx.type === 'spend' && tx.currencyType === currencyType)
        .reduce((sum, tx) => sum + tx.amount, 0)
    );
  }

  /**
   * 获取货币统计
   */
  getCurrencyStats() {
    return {
      balance: { ...this.balance },
      totalTransactions: this.transactions.length,
      earnings: {
        coins: this.getTotalEarned('coins'),
        gems: this.getTotalEarned('gems'),
        tokens: this.getTotalEarned('tokens'),
      },
      spending: {
        coins: this.getTotalSpent('coins'),
        gems: this.getTotalSpent('gems'),
        tokens: this.getTotalSpent('tokens'),
      },
      netWorth: this.calculateNetWorth(),
      canClaimDaily: this.canClaimDailyBonus(),
      timeUntilDaily: this.getTimeUntilNextDailyBonus(),
    };
  }

  /**
   * 计算净资产（所有货币折算成gems）
   */
  private calculateNetWorth(): number {
    const coinsInGems = this.balance.coins / this.exchangeRates.coins_to_gems;
    const tokensInGems = this.balance.tokens / 2;
    return Math.floor(this.balance.gems + coinsInGems + tokensInGems);
  }

  /**
   * 批量发放货币
   */
  async batchEarn(rewards: Array<{ type: CurrencyType; amount: number; reason: string }>): Promise<Currency> {
    for (const reward of rewards) {
      await this.earnCurrency(reward.type, reward.amount, reward.reason);
    }
    return { ...this.balance };
  }

  /**
   * 批量扣除货币
   */
  async batchSpend(costs: Array<{ type: CurrencyType; amount: number; reason: string }>): Promise<boolean> {
    // 先检查所有货币是否足够
    for (const cost of costs) {
      if (this.balance[cost.type] < cost.amount) {
        console.warn(`❌ Insufficient ${cost.type}: need ${cost.amount}, have ${this.balance[cost.type]}`);
        return false;
      }
    }

    // 全部扣除
    for (const cost of costs) {
      await this.spendCurrency(cost.type, cost.amount, cost.reason);
    }

    return true;
  }

  /**
   * 重置余额（仅用于测试）
   */
  resetBalance(newBalance?: Partial<Currency>): void {
    this.balance = {
      coins: newBalance?.coins ?? 0,
      gems: newBalance?.gems ?? 0,
      tokens: newBalance?.tokens ?? 0,
    };

    this.transactions = [];
    this.lastDailyBonus = null;

    console.log('🔄 Balance reset');
  }

  /**
   * 导出数据
   */
  export() {
    return {
      balance: { ...this.balance },
      transactions: [...this.transactions],
      lastDailyBonus: this.lastDailyBonus?.toISOString(),
    };
  }

  /**
   * 导入数据
   */
  import(data: { balance: Currency; transactions: CurrencyTransaction[]; lastDailyBonus?: string }): void {
    this.balance = { ...data.balance };
    this.transactions = [...data.transactions];
    this.lastDailyBonus = data.lastDailyBonus ? new Date(data.lastDailyBonus) : null;

    console.log('📥 Data imported');
  }
}

// 导出单例实例
export const currencyManager = new CurrencyManager({
  coins: 1000, // 初始1000 coins
  gems: 10, // 初始10 gems
  tokens: 5, // 初始5 tokens
});
