/**
 * RTL Provider组件
 *
 * 监听语言变化，自动设置文档方向
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setDocumentDirection } from '@/utils/rtl';

interface RTLProviderProps {
  children: React.ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // 监听语言变化，自动设置文档方向
    setDocumentDirection(i18n.language);

    // 监听语言变化事件
    const handleLanguageChange = (lng: string) => {
      setDocumentDirection(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    // 清理
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return <>{children}</>;
}
