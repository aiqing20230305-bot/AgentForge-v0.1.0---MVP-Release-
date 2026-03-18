/**
 * RTL Hook - 检测和管理RTL布局状态
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useRTL() {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    // RTL语言列表
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const currentLanguage = i18n.language.split('-')[0];
    const rtlDetected = rtlLanguages.includes(currentLanguage);

    setIsRTL(rtlDetected);
    setDirection(rtlDetected ? 'rtl' : 'ltr');

    // 更新document dir属性
    document.documentElement.dir = rtlDetected ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-dir', rtlDetected ? 'rtl' : 'ltr');

    // 更新body class
    if (rtlDetected) {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return {
    isRTL,
    direction,
    isLTR: !isRTL,
  };
}

// CSS逻辑属性辅助函数
export function useRTLStyles() {
  const { isRTL } = useRTL();

  return {
    // margin/padding逻辑属性
    marginStart: (value: string) => ({
      [isRTL ? 'marginRight' : 'marginLeft']: value,
    }),
    marginEnd: (value: string) => ({
      [isRTL ? 'marginLeft' : 'marginRight']: value,
    }),
    paddingStart: (value: string) => ({
      [isRTL ? 'paddingRight' : 'paddingLeft']: value,
    }),
    paddingEnd: (value: string) => ({
      [isRTL ? 'paddingLeft' : 'paddingRight']: value,
    }),

    // 定位逻辑属性
    start: (value: string) => ({
      [isRTL ? 'right' : 'left']: value,
    }),
    end: (value: string) => ({
      [isRTL ? 'left' : 'right']: value,
    }),

    // 文本对齐
    textStart: () => ({
      textAlign: isRTL ? 'right' : 'left',
    } as const),
    textEnd: () => ({
      textAlign: isRTL ? 'left' : 'right',
    } as const),

    // 浮动
    floatStart: () => ({
      float: isRTL ? 'right' : 'left',
    } as const),
    floatEnd: () => ({
      float: isRTL ? 'left' : 'right',
    } as const),

    // 边框
    borderStart: (value: string) => ({
      [isRTL ? 'borderRight' : 'borderLeft']: value,
    }),
    borderEnd: (value: string) => ({
      [isRTL ? 'borderLeft' : 'borderRight']: value,
    }),

    // 边框半径
    borderStartStartRadius: (value: string) => ({
      [isRTL ? 'borderTopRightRadius' : 'borderTopLeftRadius']: value,
    }),
    borderStartEndRadius: (value: string) => ({
      [isRTL ? 'borderTopLeftRadius' : 'borderTopRightRadius']: value,
    }),
    borderEndStartRadius: (value: string) => ({
      [isRTL ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: value,
    }),
    borderEndEndRadius: (value: string) => ({
      [isRTL ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: value,
    }),

    // transform
    translateX: (value: number) => ({
      transform: `translateX(${isRTL ? -value : value}px)`,
    }),
    scaleX: (shouldFlip: boolean) => ({
      transform: isRTL && shouldFlip ? 'scaleX(-1)' : 'scaleX(1)',
    }),
  };
}

// 获取RTL感知的CSS类名
export function useRTLClassNames() {
  const { isRTL } = useRTL();

  return {
    textStart: isRTL ? 'text-right' : 'text-left',
    textEnd: isRTL ? 'text-left' : 'text-right',
    marginStart: (size: string) => (isRTL ? `mr-${size}` : `ml-${size}`),
    marginEnd: (size: string) => (isRTL ? `ml-${size}` : `mr-${size}`),
    paddingStart: (size: string) => (isRTL ? `pr-${size}` : `pl-${size}`),
    paddingEnd: (size: string) => (isRTL ? `pl-${size}` : `pr-${size}`),
    floatStart: isRTL ? 'float-right' : 'float-left',
    floatEnd: isRTL ? 'float-left' : 'float-right',
    borderStart: isRTL ? 'border-r' : 'border-l',
    borderEnd: isRTL ? 'border-l' : 'border-r',
    roundedStart: isRTL ? 'rounded-r' : 'rounded-l',
    roundedEnd: isRTL ? 'rounded-l' : 'rounded-r',
  };
}
