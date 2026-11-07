import { useTranslation } from 'react-i18next'

const RTL_PREFIXES = ['ar', 'he', 'fa', 'ur']

function languageIsRTL(language: string | undefined): boolean {
  if (!language) return false
  const base = language.toLowerCase().split('-')[0]
  return RTL_PREFIXES.includes(base)
}

export function useRTL() {
  const { i18n } = useTranslation()
  const isRTL = languageIsRTL(i18n.language) || (typeof document !== 'undefined' && document.documentElement.dir === 'rtl')
  const direction: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr'
  return { isRTL, direction }
}

export function useRTLClassNames() {
  const { isRTL } = useRTL()
  return {
    textStart: isRTL ? 'text-right' : 'text-left',
    textEnd: isRTL ? 'text-left' : 'text-right',
    marginStart: (size: string) => (isRTL ? `mr-${size}` : `ml-${size}`),
    paddingEnd: (size: string) => (isRTL ? `pl-${size}` : `pr-${size}`),
  }
}

export function useRTLStyles() {
  const { isRTL } = useRTL()
  return {
    textStart: (): React.CSSProperties => ({ textAlign: isRTL ? 'right' : 'left' }),
    textEnd: (): React.CSSProperties => ({ textAlign: isRTL ? 'left' : 'right' }),
  }
}
