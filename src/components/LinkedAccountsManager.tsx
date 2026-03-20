/**
 * Linked Accounts Manager Component
 * v2.5.0 Phase 1.2 - OAuth Social Login
 *
 * 已绑定账号管理组件
 */

import React, { useEffect, useState } from 'react';
import { FaGithub, FaGoogle, FaLink, FaUnlink, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

export interface LinkedAccount {
  provider: 'github' | 'google';
  email: string;
  name: string;
  linkedAt: Date;
}

export const LinkedAccountsManager: React.FC = () => {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/oauth/linked`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAccounts(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch linked accounts:', err);
      setError('无法加载已绑定的账号');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = (provider: 'github' | 'google') => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/oauth/${provider}?redirect=${encodeURIComponent(window.location.href)}`;
    window.location.href = url;
  };

  const handleUnlinkAccount = async (provider: 'github' | 'google') => {
    if (!confirm(`确定要解除绑定${provider === 'github' ? 'GitHub' : 'Google'}账号吗？`)) {
      return;
    }

    try {
      setUnlinking(provider);
      setError(null);

      const token = localStorage.getItem('auth_token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/oauth/unlink/${provider}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 更新列表
      setAccounts(accounts.filter((acc) => acc.provider !== provider));
    } catch (err: any) {
      console.error(`Failed to unlink ${provider} account:`, err);
      setError(err.response?.data?.message || '解除绑定失败，请重试');
    } finally {
      setUnlinking(null);
    }
  };

  const getProviderIcon = (provider: 'github' | 'google') => {
    if (provider === 'github') {
      return <FaGithub className="text-2xl" />;
    }
    return <FaGoogle className="text-2xl" />;
  };

  const getProviderName = (provider: 'github' | 'google') => {
    return provider === 'github' ? 'GitHub' : 'Google';
  };

  const isLinked = (provider: 'github' | 'google') => {
    return accounts.some((acc) => acc.provider === provider);
  };

  const getLinkedAccount = (provider: 'github' | 'google') => {
    return accounts.find((acc) => acc.provider === provider);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="text-3xl text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">社交账号绑定</h3>
        <p className="text-sm text-gray-600">
          绑定社交账号后，您可以使用这些账号快速登录
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 账号列表 */}
      <div className="space-y-4">
        {(['github', 'google'] as const).map((provider) => {
          const linked = isLinked(provider);
          const account = getLinkedAccount(provider);

          return (
            <div
              key={provider}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* 图标 */}
                  <div className={`${linked ? 'text-gray-900' : 'text-gray-400'}`}>
                    {getProviderIcon(provider)}
                  </div>

                  {/* 账号信息 */}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {getProviderName(provider)}
                    </h4>
                    {linked && account ? (
                      <div className="text-sm text-gray-600">
                        <p>{account.name}</p>
                        <p className="text-xs text-gray-500">{account.email}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">未绑定</p>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div>
                  {linked ? (
                    <button
                      onClick={() => handleUnlinkAccount(provider)}
                      disabled={unlinking === provider || accounts.length <= 1}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={accounts.length <= 1 ? '至少需要保留一个登录方式' : '解除绑定'}
                    >
                      {unlinking === provider ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaUnlink />
                      )}
                      <span className="text-sm font-medium">解除绑定</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLinkAccount(provider)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FaLink />
                      <span className="text-sm font-medium">绑定账号</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 绑定时间 */}
              {linked && account && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    绑定时间：
                    {new Date(account.linkedAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>提示：</strong>
          为了账号安全，您至少需要保留一种登录方式。建议绑定多个社交账号，方便快速登录。
        </p>
      </div>
    </div>
  );
};

export default LinkedAccountsManager;
