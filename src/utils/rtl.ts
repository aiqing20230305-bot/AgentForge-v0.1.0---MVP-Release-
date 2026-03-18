/**
 * RTL（Right-to-Left）工具函数
 *
 * 支持阿拉伯语、希伯来语等RTL语言
 */

/**
 * RTL语言列表
 */
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * 检测语言是否为RTL
 */
export const isRTL = (language: string): boolean => {
  const langCode = language.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.includes(langCode);
};

/**
 * 设置文档方向
 */
export const setDocumentDirection = (language: string): void => {
  const dir = isRTL(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;

  console.log(`📝 Document direction set to: ${dir} (language: ${language})`);
};

/**
 * 获取当前文档方向
 */
export const getDocumentDirection = (): 'rtl' | 'ltr' => {
  return (document.documentElement.dir as 'rtl' | 'ltr') || 'ltr';
};

/**
 * 检查当前是否为RTL模式
 */
export const isRTLMode = (): boolean => {
  return getDocumentDirection() === 'rtl';
};

/**
 * 镜像翻转值（用于margin、padding等）
 */
export const mirror = (value: number): number => {
  return isRTLMode() ? -value : value;
};

/**
 * 获取逻辑属性名称
 * 例如: 'margin-left' -> 'margin-inline-start'
 */
export const getLogicalProperty = (property: string): string => {
  const logicalMap: Record<string, string> = {
    'margin-left': 'margin-inline-start',
    'margin-right': 'margin-inline-end',
    'padding-left': 'padding-inline-start',
    'padding-right': 'padding-inline-end',
    'border-left': 'border-inline-start',
    'border-right': 'border-inline-end',
    left: 'inset-inline-start',
    right: 'inset-inline-end',
  };

  return logicalMap[property] || property;
};

/**
 * RTL感知的样式对象
 */
export const rtlStyle = (styles: Record<string, any>): Record<string, any> => {
  if (!isRTLMode()) {
    return styles;
  }

  const rtlStyles: Record<string, any> = {};

  for (const [key, value] of Object.entries(styles)) {
    // 转换left/right属性
    if (key === 'left') {
      rtlStyles.right = value;
    } else if (key === 'right') {
      rtlStyles.left = value;
    } else if (key === 'marginLeft') {
      rtlStyles.marginRight = value;
    } else if (key === 'marginRight') {
      rtlStyles.marginLeft = value;
    } else if (key === 'paddingLeft') {
      rtlStyles.paddingRight = value;
    } else if (key === 'paddingRight') {
      rtlStyles.paddingLeft = value;
    } else if (key === 'borderLeft') {
      rtlStyles.borderRight = value;
    } else if (key === 'borderRight') {
      rtlStyles.borderLeft = value;
    } else {
      rtlStyles[key] = value;
    }
  }

  return rtlStyles;
};

/**
 * RTL感知的类名
 */
export const rtlClass = (ltrClass: string, rtlClass: string): string => {
  return isRTLMode() ? rtlClass : ltrClass;
};

/**
 * RTL感知的文本对齐
 */
export const rtlTextAlign = (align: 'left' | 'right' | 'center'): 'left' | 'right' | 'center' => {
  if (align === 'center' || !isRTLMode()) {
    return align;
  }

  return align === 'left' ? 'right' : 'left';
};
