/**
 * 货币管理Hook
 * 提供货币检测、设置和格式化功能
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getConfig,
  updateConfig,
  detectCurrency,
  formatCurrency,
  getSupportedCurrencies,
} from '../utils/localization'

export interface Currency {
  code: string
  symbol: string
  name: string
}

export interface UseCurrencyResult {
  currency: string
  setCurrency: (currency: string) => void
  detectAndSetCurrency: () => void
  format: (amount: number, currencyCode?: string) => string
  supportedCurrencies: Currency[]
  getCurrencySymbol: (currencyCode?: string) => string
}

/**
 * 货币管理Hook
 */
export function useCurrency(): UseCurrencyResult {
  const [currency, setCurrencyState] = useState<string>(() => {
    return getConfig().currency
  })

  const supportedCurrencies = getSupportedCurrencies()

  // 监听配置变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'localization_config' && e.newValue) {
        try {
          const config = JSON.parse(e.newValue)
          setCurrencyState(config.currency)
        } catch (error) {
          console.error('Failed to parse localization config:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  /**
   * 设置货币
   */
  const setCurrency = useCallback((newCurrency: string) => {
    updateConfig({ currency: newCurrency })
    setCurrencyState(newCurrency)
  }, [])

  /**
   * 自动检测并设置货币
   */
  const detectAndSetCurrency = useCallback(() => {
    const detectedCurrency = detectCurrency()
    setCurrency(detectedCurrency)
  }, [setCurrency])

  /**
   * 格式化货币
   */
  const format = useCallback(
    (amount: number, currencyCode?: string) => {
      return formatCurrency(amount, currencyCode || currency)
    },
    [currency]
  )

  /**
   * 获取货币符号
   */
  const getCurrencySymbol = useCallback(
    (currencyCode?: string): string => {
      const code = currencyCode || currency
      const found = supportedCurrencies.find((c) => c.code === code)
      return found?.symbol || code
    },
    [currency, supportedCurrencies]
  )

  return {
    currency,
    setCurrency,
    detectAndSetCurrency,
    format,
    supportedCurrencies,
    getCurrencySymbol,
  }
}

/**
 * 货币格式化Hook - 格式化金额为货币字符串
 * @param amount 金额
 * @param currencyCode 货币代码（可选）
 */
export function useFormatCurrency(
  amount: number | null | undefined,
  currencyCode?: string
): string {
  const { format } = useCurrency()

  return amount !== null && amount !== undefined ? format(amount, currencyCode) : ''
}

/**
 * 价格显示Hook - 显示价格并支持多种货币
 * @param prices 价格对象，键为货币代码，值为金额
 */
export function usePrice(prices: Record<string, number> | null | undefined): string {
  const { currency, format } = useCurrency()

  if (!prices) return ''

  // 尝试使用当前货币
  if (prices[currency] !== undefined) {
    return format(prices[currency], currency)
  }

  // 回退到第一个可用的货币
  const firstCurrency = Object.keys(prices)[0]
  if (firstCurrency && prices[firstCurrency] !== undefined) {
    return format(prices[firstCurrency], firstCurrency)
  }

  return ''
}

/**
 * 货币转换Hook - 根据汇率转换货币
 * @param amount 金额
 * @param fromCurrency 源货币
 * @param toCurrency 目标货币（可选，默认使用当前货币）
 * @param exchangeRates 汇率对象（键为 'FROM_TO' 格式，例如 'USD_CNY'）
 */
export function useCurrencyConversion(
  amount: number,
  fromCurrency: string,
  toCurrency?: string,
  exchangeRates?: Record<string, number>
): {
  convertedAmount: number
  formattedAmount: string
} {
  const { currency: userCurrency, format } = useCurrency()
  const targetCurrency = toCurrency || userCurrency

  // 如果货币相同，直接返回
  if (fromCurrency === targetCurrency) {
    return {
      convertedAmount: amount,
      formattedAmount: format(amount, targetCurrency),
    }
  }

  // 如果没有提供汇率，返回原值
  if (!exchangeRates) {
    return {
      convertedAmount: amount,
      formattedAmount: format(amount, fromCurrency),
    }
  }

  // 查找汇率
  const rateKey = `${fromCurrency}_${targetCurrency}`
  const reverseRateKey = `${targetCurrency}_${fromCurrency}`

  let convertedAmount = amount

  if (exchangeRates[rateKey]) {
    convertedAmount = amount * exchangeRates[rateKey]
  } else if (exchangeRates[reverseRateKey]) {
    convertedAmount = amount / exchangeRates[reverseRateKey]
  }

  return {
    convertedAmount,
    formattedAmount: format(convertedAmount, targetCurrency),
  }
}
