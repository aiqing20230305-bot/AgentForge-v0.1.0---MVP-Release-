/**
 * Social Login Buttons Component
 * v2.5.0 Phase 1.2 - OAuth Social Login
 *
 * 社交登录按钮组件
 */

import React from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

export interface SocialLoginButtonsProps {
  /** 登录成功后的重定向URL */
  redirectUrl?: string;
  /** 是否显示分隔线 */
  showDivider?: boolean;
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large';
  /** 按钮样式 */
  variant?: 'outline' | 'solid';
}

/**
 * 社交登录按钮组件
 */
export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  redirectUrl,
  showDivider = true,
  size = 'medium',
  variant = 'outline',
}) => {
  const handleGitHubLogin = () => {
    const params = new URLSearchParams();
    if (redirectUrl) {
      params.append('redirect', redirectUrl);
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/oauth/github?${params.toString()}`;
    window.location.href = url;
  };

  const handleGoogleLogin = () => {
    const params = new URLSearchParams();
    if (redirectUrl) {
      params.append('redirect', redirectUrl);
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/oauth/google?${params.toString()}`;
    window.location.href = url;
  };

  // 按钮尺寸样式
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-base',
    large: 'px-6 py-3 text-lg',
  };

  // 按钮样式
  const variantClasses = {
    outline: 'border-2 bg-white hover:bg-gray-50 text-gray-700',
    solid: 'bg-gray-800 hover:bg-gray-900 text-white',
  };

  const buttonClass = `
    w-full flex items-center justify-center gap-3
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    rounded-lg font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim();

  return (
    <div className="space-y-3">
      {showDivider && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或使用社交账号登录</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {/* GitHub登录按钮 */}
        <button
          onClick={handleGitHubLogin}
          className={buttonClass}
          type="button"
          aria-label="使用GitHub登录"
        >
          <FaGithub className="text-xl" />
          <span>使用 GitHub 登录</span>
        </button>

        {/* Google登录按钮 */}
        <button
          onClick={handleGoogleLogin}
          className={buttonClass}
          type="button"
          aria-label="使用Google登录"
        >
          <FaGoogle className="text-xl" />
          <span>使用 Google 登录</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
