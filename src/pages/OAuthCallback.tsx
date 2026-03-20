/**
 * OAuth Callback Page
 * v2.5.0 Phase 1.2 - OAuth Social Login
 *
 * OAuth授权回调页面
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

export const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理授权...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (error) {
      setStatus('error');
      setMessage(getErrorMessage(error));

      // 3秒后跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    if (token) {
      // 保存token到localStorage
      localStorage.setItem('auth_token', token);

      setStatus('success');
      setMessage(isNewUser ? '欢迎加入AgentForge！' : '登录成功！');

      // 2秒后跳转到首页
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setStatus('error');
      setMessage('授权失败：未收到有效的认证信息');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      access_denied: '您拒绝了授权请求',
      invalid_request: '无效的授权请求',
      invalid_state: '授权状态验证失败，请重试',
      invalid_code: '授权码无效或已过期',
      token_exchange_failed: '无法获取访问令牌，请重试',
      user_info_failed: '无法获取用户信息，请重试',
      account_linking_failed: '账号关联失败，请重试',
      provider_not_configured: 'OAuth服务未配置，请联系管理员',
      unknown_error: '发生未知错误，请重试',
    };

    return errorMessages[error] || '授权失败，请重试';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            {/* 状态图标 */}
            <div className="mb-6">
              {status === 'loading' && (
                <FaSpinner className="text-6xl text-blue-500 mx-auto animate-spin" />
              )}
              {status === 'success' && (
                <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
              )}
              {status === 'error' && (
                <FaExclamationCircle className="text-6xl text-red-500 mx-auto" />
              )}
            </div>

            {/* 状态标题 */}
            <h2 className="text-2xl font-bold mb-2">
              {status === 'loading' && '处理中...'}
              {status === 'success' && '授权成功'}
              {status === 'error' && '授权失败'}
            </h2>

            {/* 状态消息 */}
            <p className="text-gray-600 mb-6">{message}</p>

            {/* 加载动画 */}
            {status === 'loading' && (
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            {/* 错误时的返回按钮 */}
            {status === 'error' && (
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回登录页
              </button>
            )}

            {/* 自动跳转提示 */}
            {status !== 'loading' && (
              <p className="text-sm text-gray-500 mt-6">
                {status === 'success' ? '即将跳转到首页...' : '即将返回登录页...'}
              </p>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>遇到问题？请联系 support@agentforge.com</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
