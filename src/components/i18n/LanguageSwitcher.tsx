import React from 'react';

/**
 * 语言切换器组件
 * v2.2.0 - 国际化支持
 */

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' }
];

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = React.useState('en-US');

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    // TODO: 集成i18next
    // i18n.changeLanguage(languageCode);
    localStorage.setItem('preferred-language', languageCode);
  };

  return (
    <div className="language-switcher">
      <select 
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="language-select"
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
