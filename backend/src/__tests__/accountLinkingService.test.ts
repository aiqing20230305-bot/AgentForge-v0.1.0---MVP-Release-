/**
 * Account Linking Service Tests
 * v2.5.0 Phase 1.2 - OAuth Social Login
 */

import { AccountLinkingService } from '../services/accountLinkingService';
import { OAuthUser } from '../services/oauthService';
import { OAuthError, OAuthErrorType } from '../config/oauthConfig';

describe('AccountLinkingService', () => {
  let service: AccountLinkingService;

  beforeEach(() => {
    service = new AccountLinkingService();
    service.clearAll();
  });

  describe('loginOrRegisterWithOAuth', () => {
    const mockOAuthUser: OAuthUser = {
      provider: 'github',
      providerId: 'github-123',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://avatar.url',
      accessToken: 'access-token',
    };

    it('should create new user on first login', async () => {
      const result = await service.loginOrRegisterWithOAuth(mockOAuthUser);

      expect(result.isNewUser).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
      expect(result.oauthAccount.provider).toBe('github');
      expect(result.oauthAccount.providerId).toBe('github-123');
    });

    it('should return existing user on subsequent login', async () => {
      // First login
      const firstResult = await service.loginOrRegisterWithOAuth(mockOAuthUser);

      // Second login with updated token
      const updatedOAuthUser = { ...mockOAuthUser, accessToken: 'new-token' };
      const secondResult = await service.loginOrRegisterWithOAuth(updatedOAuthUser);

      expect(secondResult.isNewUser).toBe(false);
      expect(secondResult.user.id).toBe(firstResult.user.id);
      expect(secondResult.oauthAccount.accessToken).toBe('new-token');
    });

    it('should link OAuth account to existing user with same email', async () => {
      // Create user via GitHub
      const githubUser: OAuthUser = {
        ...mockOAuthUser,
        provider: 'github',
        providerId: 'github-123',
      };
      const githubResult = await service.loginOrRegisterWithOAuth(githubUser);

      // Login with Google using same email
      const googleUser: OAuthUser = {
        ...mockOAuthUser,
        provider: 'google',
        providerId: 'google-456',
      };
      const googleResult = await service.loginOrRegisterWithOAuth(googleUser);

      expect(googleResult.user.id).toBe(githubResult.user.id);
      expect(googleResult.isNewUser).toBe(false);

      // Verify both accounts are linked
      const accounts = await service.getLinkedOAuthAccounts(githubResult.user.id);
      expect(accounts).toHaveLength(2);
      expect(accounts.some((acc) => acc.provider === 'github')).toBe(true);
      expect(accounts.some((acc) => acc.provider === 'google')).toBe(true);
    });

    it('should update refresh token if provided', async () => {
      const oauthUserWithRefresh: OAuthUser = {
        ...mockOAuthUser,
        refreshToken: 'refresh-token',
      };

      const result = await service.loginOrRegisterWithOAuth(oauthUserWithRefresh);

      expect(result.oauthAccount.refreshToken).toBe('refresh-token');
    });
  });

  describe('linkOAuthAccount', () => {
    it('should link OAuth account to existing user', async () => {
      // Create user
      const oauthUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'token',
      };
      const { user } = await service.loginOrRegisterWithOAuth(oauthUser);

      // Link Google account
      const googleUser: OAuthUser = {
        provider: 'google',
        providerId: 'google-456',
        email: 'test@gmail.com',
        name: 'Test User',
        accessToken: 'google-token',
      };
      const account = await service.linkOAuthAccount(user.id, googleUser);

      expect(account.provider).toBe('google');
      expect(account.userId).toBe(user.id);

      // Verify linked accounts
      const accounts = await service.getLinkedOAuthAccounts(user.id);
      expect(accounts).toHaveLength(2);
    });

    it('should throw error for non-existent user', async () => {
      const oauthUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'token',
      };

      await expect(
        service.linkOAuthAccount('non-existent-user-id', oauthUser)
      ).rejects.toThrow(OAuthError);

      await expect(
        service.linkOAuthAccount('non-existent-user-id', oauthUser)
      ).rejects.toThrow(OAuthErrorType.ACCOUNT_LINKING_FAILED);
    });

    it('should throw error when linking to different user', async () => {
      // Create first user
      const user1OAuth: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'user1@example.com',
        name: 'User 1',
        accessToken: 'token1',
      };
      const { user: user1 } = await service.loginOrRegisterWithOAuth(user1OAuth);

      // Create second user
      const user2OAuth: OAuthUser = {
        provider: 'google',
        providerId: 'google-456',
        email: 'user2@example.com',
        name: 'User 2',
        accessToken: 'token2',
      };
      const { user: user2 } = await service.loginOrRegisterWithOAuth(user2OAuth);

      // Try to link user1's GitHub to user2
      await expect(
        service.linkOAuthAccount(user2.id, user1OAuth)
      ).rejects.toThrow('OAuth account is already linked to another user');
    });

    it('should update token if already linked to same user', async () => {
      const oauthUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'old-token',
      };
      const { user } = await service.loginOrRegisterWithOAuth(oauthUser);

      // Link same account with new token
      const updatedOAuthUser = { ...oauthUser, accessToken: 'new-token' };
      const account = await service.linkOAuthAccount(user.id, updatedOAuthUser);

      expect(account.accessToken).toBe('new-token');
    });
  });

  describe('unlinkOAuthAccount', () => {
    it('should unlink OAuth account', async () => {
      // Create user with GitHub
      const githubUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'token',
      };
      const { user } = await service.loginOrRegisterWithOAuth(githubUser);

      // Link Google
      const googleUser: OAuthUser = {
        provider: 'google',
        providerId: 'google-456',
        email: 'test@gmail.com',
        name: 'Test User',
        accessToken: 'token',
      };
      await service.linkOAuthAccount(user.id, googleUser);

      // Unlink GitHub
      const success = await service.unlinkOAuthAccount(user.id, 'github');

      expect(success).toBe(true);

      // Verify only Google remains
      const accounts = await service.getLinkedOAuthAccounts(user.id);
      expect(accounts).toHaveLength(1);
      expect(accounts[0].provider).toBe('google');
    });

    it('should return false for non-existent OAuth account', async () => {
      const oauthUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'token',
      };
      const { user } = await service.loginOrRegisterWithOAuth(oauthUser);

      // Try to unlink non-existent Google account
      const success = await service.unlinkOAuthAccount(user.id, 'google');

      expect(success).toBe(false);
    });

    it('should throw error when unlinking last auth method', async () => {
      const oauthUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'token',
      };
      const { user } = await service.loginOrRegisterWithOAuth(oauthUser);

      // Try to unlink the only OAuth account
      await expect(
        service.unlinkOAuthAccount(user.id, 'github')
      ).rejects.toThrow('Cannot unlink the last authentication method');
    });
  });

  describe('getLinkedOAuthAccounts', () => {
    it('should return all linked accounts', async () => {
      // Create user with GitHub
      const githubUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'token',
      };
      const { user } = await service.loginOrRegisterWithOAuth(githubUser);

      // Link Google
      const googleUser: OAuthUser = {
        provider: 'google',
        providerId: 'google-456',
        email: 'test@gmail.com',
        name: 'Test User',
        accessToken: 'token',
      };
      await service.linkOAuthAccount(user.id, googleUser);

      // Get accounts
      const accounts = await service.getLinkedOAuthAccounts(user.id);

      expect(accounts).toHaveLength(2);
      expect(accounts.some((acc) => acc.provider === 'github')).toBe(true);
      expect(accounts.some((acc) => acc.provider === 'google')).toBe(true);
      expect(accounts.every((acc) => acc.linkedAt instanceof Date)).toBe(true);
    });

    it('should return empty array for user with no accounts', async () => {
      const accounts = await service.getLinkedOAuthAccounts('non-existent-user');

      expect(accounts).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple logins with token updates', async () => {
      const oauthUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'token1',
      };

      // First login
      const result1 = await service.loginOrRegisterWithOAuth(oauthUser);
      expect(result1.oauthAccount.accessToken).toBe('token1');

      // Second login with new token
      oauthUser.accessToken = 'token2';
      const result2 = await service.loginOrRegisterWithOAuth(oauthUser);
      expect(result2.oauthAccount.accessToken).toBe('token2');
      expect(result2.user.id).toBe(result1.user.id);
    });

    it('should handle linking and unlinking multiple times', async () => {
      const githubUser: OAuthUser = {
        provider: 'github',
        providerId: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
        accessToken: 'token',
      };
      const { user } = await service.loginOrRegisterWithOAuth(githubUser);

      const googleUser: OAuthUser = {
        provider: 'google',
        providerId: 'google-456',
        email: 'test@gmail.com',
        name: 'Test User',
        accessToken: 'token',
      };

      // Link Google
      await service.linkOAuthAccount(user.id, googleUser);
      let accounts = await service.getLinkedOAuthAccounts(user.id);
      expect(accounts).toHaveLength(2);

      // Unlink Google
      await service.unlinkOAuthAccount(user.id, 'google');
      accounts = await service.getLinkedOAuthAccounts(user.id);
      expect(accounts).toHaveLength(1);

      // Link Google again
      await service.linkOAuthAccount(user.id, googleUser);
      accounts = await service.getLinkedOAuthAccounts(user.id);
      expect(accounts).toHaveLength(2);
    });
  });
});
