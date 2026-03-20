/**
 * 简单的路由器
 * 支持/@username公开主页路由
 */

import React, { useEffect, useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { PublicProfilePage } from './components/PublicProfile/PublicProfilePage';

// Web版特性检测
const isElectron = typeof window !== 'undefined' && (window as any).electron;
const isWeb = !isElectron;

// Web版: 懒加载WebApp组件
const WebApp = isWeb
  ? React.lazy(() => import('./components/WebApp').then(module => ({ default: module.WebApp })))
  : null;

export function Router() {
  const [currentRoute, setCurrentRoute] = useState<{
    type: 'app' | 'profile';
    username?: string;
  }>({ type: 'app' });

  useEffect(() => {
    // 检查当前路径
    const path = window.location.pathname;

    // 匹配/@username格式
    const profileMatch = path.match(/^\/@([a-zA-Z0-9_-]+)$/);

    if (profileMatch) {
      setCurrentRoute({
        type: 'profile',
        username: profileMatch[1],
      });
    } else {
      setCurrentRoute({ type: 'app' });
    }

    // 监听popstate事件（浏览器前进/后退）
    const handlePopState = () => {
      const newPath = window.location.pathname;
      const newMatch = newPath.match(/^\/@([a-zA-Z0-9_-]+)$/);

      if (newMatch) {
        setCurrentRoute({
          type: 'profile',
          username: newMatch[1],
        });
      } else {
        setCurrentRoute({ type: 'app' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 公开主页总是直接渲染（不需要Web版包装）
  if (currentRoute.type === 'profile' && currentRoute.username) {
    return (
      <HelmetProvider>
        <ProfilePageWrapper username={currentRoute.username} />
      </HelmetProvider>
    );
  }

  // 主应用：根据环境选择组件
  const AppComponent = isWeb && WebApp ? WebApp : App;

  return (
    <HelmetProvider>
      {isWeb && WebApp ? (
        <React.Suspense
          fallback={
            <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
                <div className="mt-4 text-white text-lg">Loading AgentForge...</div>
              </div>
            </div>
          }
        >
          <AppComponent />
        </React.Suspense>
      ) : (
        <App />
      )}
    </HelmetProvider>
  );
}

// Profile页面包装器（使用username作为参数）
function ProfilePageWrapper({ username }: { username: string }) {
  // 创建一个假的useParams hook，因为我们没有使用react-router
  const MockRouterContext = React.createContext<{ username: string }>({ username });

  // 模拟useParams和useNavigate
  const mockUseParams = () => React.useContext(MockRouterContext);
  const mockUseNavigate = () => (path: string) => {
    window.location.href = path;
  };

  // 暂时通过window对象传递这些mock函数
  (window as any).__mockRouterHooks = {
    useParams: mockUseParams,
    useNavigate: mockUseNavigate,
  };

  return (
    <MockRouterContext.Provider value={{ username }}>
      <PublicProfilePage />
    </MockRouterContext.Provider>
  );
}
