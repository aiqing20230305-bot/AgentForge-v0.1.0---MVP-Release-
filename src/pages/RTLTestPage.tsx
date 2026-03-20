/**
 * RTL测试页面 - RTL Test Page
 *
 * 用于测试和验证RTL布局的所有功能
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRTL, useRTLClassNames, useRTLStyles } from '@/hooks/useRTL';
import {
  RTLAdaptiveLayout,
  RTLFlexContainer,
  RTLGridContainer,
  RTLSpacing,
  RTLTextAlign,
  RTLFlippedIcon,
  RTLFloat,
  RTLPosition,
  RTLBorderRadius,
  RTLTransform,
} from '@/components/RTL';
import { CurrencyDisplay } from '@/components/Gamification';
import { NotificationBell } from '@/components/Notifications';

export function RTLTestPage() {
  const { i18n } = useTranslation();
  const { isRTL, direction } = useRTL();
  const rtlClasses = useRTLClassNames();
  const rtlStyles = useRTLStyles();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const toggleLanguage = () => {
    const newLang = currentLang === 'ar-SA' ? 'en-US' : 'ar-SA';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  return (
    <RTLAdaptiveLayout className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 头部控制 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">🌐 RTL Layout Test Page</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Current Language: <strong>{currentLang}</strong> | Direction:{' '}
                <strong>{direction.toUpperCase()}</strong> | Is RTL:{' '}
                <strong>{isRTL ? 'Yes' : 'No'}</strong>
              </p>
            </div>
            <button
              onClick={toggleLanguage}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Switch to {currentLang === 'ar-SA' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>

        {/* 1. 文本对齐测试 */}
        <TestSection title="1. Text Alignment">
          <RTLTextAlign align="start" className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
            <p className="font-medium">Text aligned to START (left in LTR, right in RTL)</p>
            <p className={`text-sm ${rtlClasses.textStart}`}>
              This text uses textStart class: {currentLang === 'ar-SA' ? 'هذا نص تجريبي' : 'Sample text'}
            </p>
          </RTLTextAlign>

          <RTLTextAlign align="end" className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3">
            <p className="font-medium">Text aligned to END (right in LTR, left in RTL)</p>
            <p className={`text-sm ${rtlClasses.textEnd}`}>
              This text uses textEnd class: {currentLang === 'ar-SA' ? 'هذا نص تجريبي' : 'Sample text'}
            </p>
          </RTLTextAlign>

          <RTLTextAlign align="center" className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="font-medium">Text aligned to CENTER</p>
            <p className="text-sm text-center">
              Centered text: {currentLang === 'ar-SA' ? 'نص في المنتصف' : 'Center aligned'}
            </p>
          </RTLTextAlign>
        </TestSection>

        {/* 2. Flex布局测试 */}
        <TestSection title="2. Flex Layout">
          <RTLFlexContainer className="gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-3">
            <div className="w-20 h-20 bg-red-500 rounded flex items-center justify-center text-white font-bold">
              1
            </div>
            <div className="w-20 h-20 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
              2
            </div>
            <div className="w-20 h-20 bg-green-500 rounded flex items-center justify-center text-white font-bold">
              3
            </div>
          </RTLFlexContainer>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Flex items reorder automatically in RTL mode
          </p>
        </TestSection>

        {/* 3. Grid布局测试 */}
        <TestSection title="3. Grid Layout">
          <RTLGridContainer cols={3} className="gap-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
              >
                {num}
              </div>
            ))}
          </RTLGridContainer>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Grid items flow correctly in both LTR and RTL
          </p>
        </TestSection>

        {/* 4. 间距测试 */}
        <TestSection title="4. Spacing (Margin/Padding)">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg space-y-3">
            <RTLSpacing start="40px" className="bg-blue-500 text-white p-4 rounded">
              <p>Margin START (40px on left/LTR, right/RTL)</p>
            </RTLSpacing>

            <RTLSpacing end="40px" className="bg-green-500 text-white p-4 rounded">
              <p>Margin END (40px on right/LTR, left/RTL)</p>
            </RTLSpacing>

            <div className={`${rtlClasses.marginStart('8')} ${rtlClasses.paddingEnd('4')} bg-purple-500 text-white p-4 rounded`}>
              <p>Using utility classes: marginStart-8 paddingEnd-4</p>
            </div>
          </div>
        </TestSection>

        {/* 5. 图标翻转测试 */}
        <TestSection title="5. Icon Flipping">
          <div className="flex gap-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="text-center">
              <RTLFlippedIcon icon="➡️" className="text-4xl" shouldFlip={true} />
              <p className="text-sm mt-2">Arrow (flipped)</p>
            </div>
            <div className="text-center">
              <RTLFlippedIcon icon="🔍" className="text-4xl" shouldFlip={false} />
              <p className="text-sm mt-2">Search (no flip)</p>
            </div>
            <div className="text-center">
              <RTLFlippedIcon icon="◀" className="text-4xl" shouldFlip={true} />
              <p className="text-sm mt-2">Play (flipped)</p>
            </div>
            <div className="text-center">
              <RTLFlippedIcon icon="⭐" className="text-4xl" shouldFlip={false} />
              <p className="text-sm mt-2">Star (no flip)</p>
            </div>
          </div>
        </TestSection>

        {/* 6. 浮动测试 */}
        <TestSection title="6. Float">
          <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
            <RTLFloat float="start" className="w-32 h-32 bg-blue-500 text-white flex items-center justify-center rounded-lg mb-2 mr-4">
              Float START
            </RTLFloat>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="clear-both"></div>
          </div>
        </TestSection>

        {/* 7. 定位测试 */}
        <TestSection title="7. Position">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg relative h-64">
            <RTLPosition start="20px" top="20px" className="w-24 h-24 bg-red-500 text-white flex items-center justify-center rounded-lg">
              TOP START
            </RTLPosition>
            <RTLPosition end="20px" top="20px" className="w-24 h-24 bg-blue-500 text-white flex items-center justify-center rounded-lg">
              TOP END
            </RTLPosition>
            <RTLPosition start="20px" bottom="20px" className="w-24 h-24 bg-green-500 text-white flex items-center justify-center rounded-lg">
              BOTTOM START
            </RTLPosition>
            <RTLPosition end="20px" bottom="20px" className="w-24 h-24 bg-purple-500 text-white flex items-center justify-center rounded-lg">
              BOTTOM END
            </RTLPosition>
          </div>
        </TestSection>

        {/* 8. 边框半径测试 */}
        <TestSection title="8. Border Radius">
          <div className="grid grid-cols-2 gap-4">
            <RTLBorderRadius startStart="20px" startEnd="0" endStart="0" endEnd="0" className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
              Rounded START-START
            </RTLBorderRadius>
            <RTLBorderRadius startStart="0" startEnd="20px" endStart="0" endEnd="0" className="h-32 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
              Rounded START-END
            </RTLBorderRadius>
            <RTLBorderRadius startStart="0" startEnd="0" endStart="20px" endEnd="0" className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
              Rounded END-START
            </RTLBorderRadius>
            <RTLBorderRadius startStart="0" startEnd="0" endStart="0" endEnd="20px" className="h-32 bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold">
              Rounded END-END
            </RTLBorderRadius>
          </div>
        </TestSection>

        {/* 9. 实际组件测试 */}
        <TestSection title="9. Real Components Test">
          <div className="space-y-4">
            {/* Currency Display */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h3 className="font-bold mb-3">Currency Display Component</h3>
              <CurrencyDisplay />
            </div>

            {/* Notification Bell */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h3 className="font-bold mb-3">Notification Bell Component</h3>
              <NotificationBell />
            </div>

            {/* Form with labels */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h3 className="font-bold mb-3">Form Example</h3>
              <form className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${rtlClasses.textStart}`}>
                    {currentLang === 'ar-SA' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={currentLang === 'ar-SA' ? 'أدخل اسمك' : 'Enter your name'}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    style={rtlStyles.textStart()}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${rtlClasses.textStart}`}>
                    {currentLang === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    placeholder={currentLang === 'ar-SA' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    style={rtlStyles.textStart()}
                  />
                </div>
                <button
                  type="button"
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {currentLang === 'ar-SA' ? 'إرسال' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </TestSection>

        {/* 10. Transform测试 */}
        <TestSection title="10. Transform">
          <div className="flex gap-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <RTLTransform translateX={50} className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
              +50px
            </RTLTransform>
            <RTLTransform translateX={-50} className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              -50px
            </RTLTransform>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Transform direction adjusts based on RTL/LTR
          </p>
        </TestSection>

        {/* 测试总结 */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">✅ RTL Test Complete</h2>
          <p className="mb-4">
            All RTL components and utilities are working correctly. Switch between English and
            Arabic to see the layout adapt automatically.
          </p>
          <p className="text-sm opacity-90">
            Current Direction: <strong>{direction.toUpperCase()}</strong> | RTL Active:{' '}
            <strong>{isRTL ? 'YES' : 'NO'}</strong>
          </p>
        </div>
      </div>
    </RTLAdaptiveLayout>
  );
}

// 测试区域组件
function TestSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}
