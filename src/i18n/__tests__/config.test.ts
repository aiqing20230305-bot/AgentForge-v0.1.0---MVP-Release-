import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../config';

/**
 * i18n配置集成测试
 * v2.2.0 Phase 3.3
 */

describe('i18n Configuration', () => {
  beforeEach(async () => {
    // 重置语言为默认
    await i18n.changeLanguage('zh-CN');
  });

  describe('Language Support', () => {
    it('should have 4 supported languages', () => {
      const languages = Object.keys(i18n.services.resourceStore.data);
      expect(languages).toContain('zh-CN');
      expect(languages).toContain('en-US');
      expect(languages).toContain('ja-JP');
      expect(languages).toContain('ko-KR');
      expect(languages.length).toBeGreaterThanOrEqual(4);
    });

    it('should switch to English', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.language).toBe('en-US');
    });

    it('should switch to Japanese', async () => {
      await i18n.changeLanguage('ja-JP');
      expect(i18n.language).toBe('ja-JP');
    });

    it('should switch to Korean', async () => {
      await i18n.changeLanguage('ko-KR');
      expect(i18n.language).toBe('ko-KR');
    });

    it('should fallback to Chinese for unsupported language', async () => {
      await i18n.changeLanguage('fr-FR');
      expect(i18n.language).toBe('zh-CN');
    });
  });

  describe('Translation Keys', () => {
    it('should have app_name in all languages', () => {
      expect(i18n.t('app_name', { lng: 'zh-CN' })).toBe('AgentForge');
      expect(i18n.t('app_name', { lng: 'en-US' })).toBe('AgentForge');
      expect(i18n.t('app_name', { lng: 'ja-JP' })).toBe('AgentForge');
      expect(i18n.t('app_name', { lng: 'ko-KR' })).toBe('AgentForge');
    });

    it('should translate common.create', () => {
      expect(i18n.t('common.create', { lng: 'zh-CN' })).toBe('创建');
      expect(i18n.t('common.create', { lng: 'en-US' })).toBe('Create');
      expect(i18n.t('common.create', { lng: 'ja-JP' })).toBe('作成');
      expect(i18n.t('common.create', { lng: 'ko-KR' })).toBe('생성');
    });

    it('should translate agent.title', () => {
      expect(i18n.t('agent.title', { lng: 'zh-CN' })).toBe('Agent');
      expect(i18n.t('agent.title', { lng: 'en-US' })).toBe('Agent');
      expect(i18n.t('agent.title', { lng: 'ja-JP' })).toBe('エージェント');
      expect(i18n.t('agent.title', { lng: 'ko-KR' })).toBe('에이전트');
    });

    it('should translate analytics.title', () => {
      expect(i18n.t('analytics.title', { lng: 'zh-CN' })).toBe('数据分析');
      expect(i18n.t('analytics.title', { lng: 'en-US' })).toBe('Analytics');
      expect(i18n.t('analytics.title', { lng: 'ja-JP' })).toBe('分析');
      expect(i18n.t('analytics.title', { lng: 'ko-KR' })).toBe('분석');
    });

    it('should translate team.title', () => {
      expect(i18n.t('team.title', { lng: 'zh-CN' })).toBe('团队');
      expect(i18n.t('team.title', { lng: 'en-US' })).toBe('Team');
      expect(i18n.t('team.title', { lng: 'ja-JP' })).toBe('チーム');
      expect(i18n.t('team.title', { lng: 'ko-KR' })).toBe('팀');
    });

    it('should translate mobile.title', () => {
      expect(i18n.t('mobile.title', { lng: 'zh-CN' })).toBe('移动应用');
      expect(i18n.t('mobile.title', { lng: 'en-US' })).toBe('Mobile App');
      expect(i18n.t('mobile.title', { lng: 'ja-JP' })).toBe('モバイルアプリ');
      expect(i18n.t('mobile.title', { lng: 'ko-KR' })).toBe('모바일 앱');
    });
  });

  describe('Interpolation', () => {
    it('should interpolate variables in Chinese', async () => {
      await i18n.changeLanguage('zh-CN');
      const result = i18n.t('welcome', { name: '张三' });
      expect(result).toBe('欢迎, 张三!');
    });

    it('should interpolate variables in English', async () => {
      await i18n.changeLanguage('en-US');
      const result = i18n.t('welcome', { name: 'John' });
      expect(result).toBe('Welcome, John!');
    });

    it('should interpolate variables in Japanese', async () => {
      await i18n.changeLanguage('ja-JP');
      const result = i18n.t('welcome', { name: '太郎' });
      expect(result).toBe('ようこそ、太郎さん！');
    });

    it('should interpolate variables in Korean', async () => {
      await i18n.changeLanguage('ko-KR');
      const result = i18n.t('welcome', { name: '김철수' });
      expect(result).toBe('환영합니다, 김철수님!');
    });
  });

  describe('Nested Keys', () => {
    it('should access nested translation keys', () => {
      expect(i18n.t('agent.status.active', { lng: 'zh-CN' })).toBe('活跃');
      expect(i18n.t('agent.status.active', { lng: 'en-US' })).toBe('Active');
      expect(i18n.t('agent.status.active', { lng: 'ja-JP' })).toBe('アクティブ');
      expect(i18n.t('agent.status.active', { lng: 'ko-KR' })).toBe('활성');
    });

    it('should access deeply nested keys', () => {
      expect(i18n.t('task.priority.high', { lng: 'zh-CN' })).toBe('高优先级');
      expect(i18n.t('task.priority.high', { lng: 'en-US' })).toBe('High Priority');
      expect(i18n.t('task.priority.high', { lng: 'ja-JP' })).toBe('高優先度');
      expect(i18n.t('task.priority.high', { lng: 'ko-KR' })).toBe('높은 우선순위');
    });

    it('should access analytics nested keys', () => {
      expect(i18n.t('analytics.metrics.success_rate', { lng: 'zh-CN' })).toBe('成功率');
      expect(i18n.t('analytics.metrics.success_rate', { lng: 'en-US' })).toBe('Success Rate');
      expect(i18n.t('analytics.metrics.success_rate', { lng: 'ja-JP' })).toBe('成功率');
      expect(i18n.t('analytics.metrics.success_rate', { lng: 'ko-KR' })).toBe('성공률');
    });

    it('should access team roles keys', () => {
      expect(i18n.t('team.roles.admin', { lng: 'zh-CN' })).toBe('管理员');
      expect(i18n.t('team.roles.admin', { lng: 'en-US' })).toBe('Administrator');
      expect(i18n.t('team.roles.admin', { lng: 'ja-JP' })).toBe('管理者');
      expect(i18n.t('team.roles.admin', { lng: 'ko-KR' })).toBe('관리자');
    });
  });

  describe('Missing Keys', () => {
    it('should return key for missing translation', () => {
      const result = i18n.t('non.existent.key');
      expect(result).toContain('non.existent.key');
    });

    it('should not throw error for missing key', () => {
      expect(() => i18n.t('another.missing.key')).not.toThrow();
    });
  });

  describe('Language Persistence', () => {
    it('should persist language change', async () => {
      await i18n.changeLanguage('en-US');
      expect(i18n.language).toBe('en-US');

      // 模拟页面刷新后从localStorage读取
      const storedLang = localStorage.getItem('i18n_language');
      expect(storedLang).toBe('en-US');
    });
  });

  describe('v2.2.0 New Translations', () => {
    it('should have all analytics translations', () => {
      const analyticsKeys = [
        'analytics.title',
        'analytics.realtime_dashboard',
        'analytics.deep_analysis',
        'analytics.custom_reports',
      ];

      analyticsKeys.forEach(key => {
        expect(i18n.exists(key, { lng: 'zh-CN' })).toBe(true);
        expect(i18n.exists(key, { lng: 'en-US' })).toBe(true);
        expect(i18n.exists(key, { lng: 'ja-JP' })).toBe(true);
        expect(i18n.exists(key, { lng: 'ko-KR' })).toBe(true);
      });
    });

    it('should have all team translations', () => {
      const teamKeys = [
        'team.title',
        'team.create',
        'team.members',
        'team.add_member',
      ];

      teamKeys.forEach(key => {
        expect(i18n.exists(key, { lng: 'zh-CN' })).toBe(true);
        expect(i18n.exists(key, { lng: 'en-US' })).toBe(true);
        expect(i18n.exists(key, { lng: 'ja-JP' })).toBe(true);
        expect(i18n.exists(key, { lng: 'ko-KR' })).toBe(true);
      });
    });

    it('should have all mobile translations', () => {
      const mobileKeys = [
        'mobile.title',
        'mobile.download',
      ];

      mobileKeys.forEach(key => {
        expect(i18n.exists(key, { lng: 'zh-CN' })).toBe(true);
        expect(i18n.exists(key, { lng: 'en-US' })).toBe(true);
        expect(i18n.exists(key, { lng: 'ja-JP' })).toBe(true);
        expect(i18n.exists(key, { lng: 'ko-KR' })).toBe(true);
      });
    });
  });
});
