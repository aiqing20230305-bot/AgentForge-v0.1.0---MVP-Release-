/**
 * Stripe 支付服务
 * 处理订阅、支付和Webhook
 */

import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js'

/**
 * 订阅计划
 */
export interface SubscriptionPlan {
  id: string
  name: string
  priceMonthly: number
  priceYearly: number
  priceIdMonthly: string // Stripe Price ID
  priceIdYearly: string // Stripe Price ID
  features: string[]
  popular?: boolean
}

/**
 * 订阅状态
 */
export interface SubscriptionStatus {
  active: boolean
  planId: string
  planName: string
  interval: 'month' | 'year'
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
}

/**
 * 支付历史记录
 */
export interface PaymentHistory {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed'
  created: Date
  invoiceUrl?: string
  receiptUrl?: string
}

/**
 * Stripe Service 类
 */
export class StripeService {
  private stripe: Stripe | null = null
  private publishableKey: string

  constructor(publishableKey: string) {
    this.publishableKey = publishableKey
  }

  /**
   * 初始化Stripe
   */
  async initialize(): Promise<void> {
    if (this.stripe) return

    this.stripe = await loadStripe(this.publishableKey)

    if (!this.stripe) {
      throw new Error('Failed to load Stripe')
    }
  }

  /**
   * 创建Checkout Session（月度订阅）
   */
  async createCheckoutSession(
    priceId: string,
    customerId?: string
  ): Promise<string> {
    const response = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    return sessionId
  }

  /**
   * 重定向到Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!this.stripe) {
      await this.initialize()
    }

    const { error } = await this.stripe!.redirectToCheckout({ sessionId })

    if (error) {
      throw new Error(error.message || 'Failed to redirect to checkout')
    }
  }

  /**
   * 创建并重定向到Checkout（组合操作）
   */
  async checkout(priceId: string, customerId?: string): Promise<void> {
    const sessionId = await this.createCheckoutSession(priceId, customerId)
    await this.redirectToCheckout(sessionId)
  }

  /**
   * 打开Customer Portal（管理订阅）
   */
  async openCustomerPortal(customerId: string): Promise<void> {
    const response = await fetch('/api/payment/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/subscription`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const { url } = await response.json()
    window.location.href = url
  }

  /**
   * 获取订阅状态
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    const response = await fetch(`/api/payment/subscription/${userId}`)

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch subscription status')
    }

    const data = await response.json()

    return {
      active: data.status === 'active',
      planId: data.planId,
      planName: data.planName,
      interval: data.interval,
      currentPeriodEnd: new Date(data.currentPeriodEnd * 1000),
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      status: data.status,
    }
  }

  /**
   * 取消订阅（在周期结束时）
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch('/api/payment/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    })

    if (!response.ok) {
      throw new Error('Failed to cancel subscription')
    }
  }

  /**
   * 恢复订阅
   */
  async resumeSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch('/api/payment/resume-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    })

    if (!response.ok) {
      throw new Error('Failed to resume subscription')
    }
  }

  /**
   * 升级/降级订阅
   */
  async updateSubscription(
    subscriptionId: string,
    newPriceId: string
  ): Promise<void> {
    const response = await fetch('/api/payment/update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        newPriceId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to update subscription')
    }
  }

  /**
   * 获取支付历史
   */
  async getPaymentHistory(customerId: string, limit: number = 10): Promise<PaymentHistory[]> {
    const response = await fetch(
      `/api/payment/history/${customerId}?limit=${limit}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch payment history')
    }

    const data = await response.json()

    return data.map((item: any) => ({
      id: item.id,
      amount: item.amount / 100, // Convert from cents
      currency: item.currency.toUpperCase(),
      status: item.status,
      created: new Date(item.created * 1000),
      invoiceUrl: item.invoiceUrl,
      receiptUrl: item.receiptUrl,
    }))
  }

  /**
   * 下载发票
   */
  async downloadInvoice(invoiceId: string): Promise<void> {
    const response = await fetch(`/api/payment/invoice/${invoiceId}`)

    if (!response.ok) {
      throw new Error('Failed to fetch invoice')
    }

    const { url } = await response.json()
    window.open(url, '_blank')
  }

  /**
   * 创建Payment Intent（一次性支付）
   */
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<string> {
    const response = await fetch('/api/payment/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    const { clientSecret } = await response.json()
    return clientSecret
  }

  /**
   * 确认支付
   */
  async confirmPayment(
    clientSecret: string,
    paymentMethodId: string
  ): Promise<void> {
    if (!this.stripe) {
      await this.initialize()
    }

    const { error } = await this.stripe!.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    })

    if (error) {
      throw new Error(error.message || 'Payment failed')
    }
  }

  /**
   * 验证优惠码
   */
  async validateCoupon(code: string): Promise<CouponInfo | null> {
    const response = await fetch('/api/payment/validate-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      id: data.id,
      percentOff: data.percentOff,
      amountOff: data.amountOff,
      duration: data.duration,
      valid: data.valid,
    }
  }

  /**
   * 应用优惠码
   */
  async applyCoupon(subscriptionId: string, couponCode: string): Promise<void> {
    const response = await fetch('/api/payment/apply-coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
        couponCode,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to apply coupon')
    }
  }
}

/**
 * 优惠码信息
 */
interface CouponInfo {
  id: string
  percentOff?: number
  amountOff?: number
  duration: 'once' | 'forever' | 'repeating'
  valid: boolean
}

/**
 * 预定义的订阅计划
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '免费版',
    priceMonthly: 0,
    priceYearly: 0,
    priceIdMonthly: '',
    priceIdYearly: '',
    features: [
      '最多3个Agent',
      '50个任务/月',
      '100次AI调用/月',
      '基础主题',
      '标准分析功能',
    ],
  },
  {
    id: 'pro',
    name: 'Pro版',
    priceMonthly: 9.99,
    priceYearly: 99,
    priceIdMonthly: process.env.VITE_STRIPE_PRICE_MONTHLY || '',
    priceIdYearly: process.env.VITE_STRIPE_PRICE_YEARLY || '',
    popular: true,
    features: [
      '无限Agent',
      '无限任务',
      '500次AI调用/月',
      'AI智能推荐',
      '性能优化建议',
      '自定义主题',
      '高级分析',
      '团队协作',
      '优先支持',
      '战报生成',
      '成就卡片',
    ],
  },
]

/**
 * 单例实例
 */
export const stripeService = new StripeService(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
)
