/**
 * i18n Configuration - 国际化配置
 *
 * 使用i18next实现多语言支持
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 翻译资源
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';
import jaJP from './locales/ja-JP.json';
import koKR from './locales/ko-KR.json';

// ✅ 初始化i18next
i18n
  .use(initReactI18next) // 传递i18n实例给react-i18next
  .init({
    resources: {
      'en-US': { translation: enUS },
      'zh-CN': { translation: zhCN },
      'ja-JP': { translation: jaJP },
      'ko-KR': { translation: koKR },
    },

    // ✅ 默认语言和回退语言
    lng: localStorage.getItem('preferred-language') || 'en-US',
    fallbackLng: 'en-US',

    // ✅ 命名空间
    defaultNS: 'translation',

    // ✅ 调试模式（生产环境关闭）
    debug: import.meta.env.MODE === 'development',

    // ✅ 插值配置
    interpolation: {
      escapeValue: false, // React已经处理了XSS
    },

    // ✅ 检测配置
    detection: {
      // 检测顺序
      order: ['localStorage', 'navigator'],
      // 缓存键名
      caches: ['localStorage'],
    },
  });

// ✅ 语言切换事件监听
i18n.on('languageChanged', (lng) => {
  console.log(`[i18n] Language changed to: ${lng}`);

  // 保存到localStorage
  localStorage.setItem('preferred-language', lng);

  // 触发自定义事件通知其他组件
  const event = new CustomEvent('agentforge:languageChanged', {
    detail: { language: lng }
  });
  window.dispatchEvent(event);

  // 更新HTML lang属性
  document.documentElement.lang = lng;
});

export default i18n;

// ✅ 辅助函数：获取当前语言
export const getCurrentLanguage = () => i18n.language;

// ✅ 辅助函数：切换语言
export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng);
};

// ✅ 辅助函数：获取支持的语言列表
export const getSupportedLanguages = () => [
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' }
];
