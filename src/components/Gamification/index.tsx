import { useCurrency } from '@/hooks/useCurrency'

interface CurrencyDisplayProps {
  amount?: number
  currencyCode?: string
  className?: string
}

/** Formats an amount with the active localization currency. */
export function CurrencyDisplay({ amount = 0, currencyCode, className }: CurrencyDisplayProps) {
  const { format } = useCurrency()
  return <span className={className}>{format(amount, currencyCode)}</span>
}
