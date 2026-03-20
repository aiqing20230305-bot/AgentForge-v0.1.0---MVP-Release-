/**
 * OAuth Service Tests
 * v2.5.0 Phase 1.2 - OAuth Social Login
 */

import axios from 'axios';
import { OAuthService } from '../services/oauthService';
import { OAuthError, OAuthErrorType } from '../config/oauthConfig';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OAuthService', () => {
  let service: OAuthService;

  beforeEach(() => {
    service = new OAuthService();
    jest.clearAllMocks();

    // Mock环境变量
    process.env.GITHUB_CLIENT_ID = 'github-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'github-client-secret';
    process.env.GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
    process.env.OAUTH_ENABLED = 'true';
    process.env.BASE_URL = 'http://localhost:5000';
  });

  describe('getAuthorizationUrl', () => {
    it('should generate GitHub authorization URL', () => {
      const result = service.getAuthorizationUrl('github');

      expect(result.url).toContain('https://github.com/login/oauth/authorize');
      expect(result.url).toContain('client_id=github-client-id');
      expect(result.url).toContain('redirect_uri=');
      expect(result.url).toContain('scope=read%3Auser+user%3Aemail');
      expect(result.state).toBeTruthy();
    });

    it('should generate Google authorization URL', () => {
      const result = service.getAuthorizationUrl('google');

      expect(result.url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(result.url).toContain('client_id=google-client-id');
      expect(result.url).toContain('access_type=offline');
      expect(result.url).toContain('prompt=consent');
      expect(result.state).toBeTruthy();
    });

    it('should include redirect URL in state', () => {
      const redirectUrl = 'http://example.com/dashboard';
      const result = service.getAuthorizationUrl('github', redirectUrl);

      expect(result.state).toBeTruthy();
      expect(result.url).toContain('state=');
    });

    it('should throw error when provider not configured', () => {
      process.env.GITHUB_CLIENT_ID = '';

      expect(() => service.getAuthorizationUrl('github')).toThrow(OAuthError);
      expect(() => service.getAuthorizationUrl('github')).toThrow(
        OAuthErrorType.PROVIDER_NOT_CONFIGURED
      );
    });
  });

  describe('handleCallback', () => {
    it('should handle GitHub callback successfully', async () => {
      // Mock token exchange
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'github-access-token',
        },
      });

      // Mock user info
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 12345,
          login: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          avatar_url: 'https://avatar.url',
        },
      });

      const { state } = service.getAuthorizationUrl('github');
      const result = await service.handleCallback('github', 'auth-code', state);

      expect(result).toEqual({
        provider: 'github',
        providerId: '12345',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://avatar.url',
        accessToken: 'github-access-token',
        refreshToken: undefined,
      });
    });

    it('should fetch GitHub email if not provided', async () => {
      // Mock token exchange
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'github-access-token',
        },
      });

      // Mock user info without email
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 12345,
          login: 'testuser',
          name: 'Test User',
          email: null,
          avatar_url: 'https://avatar.url',
        },
      });

      // Mock emails API
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          { email: 'test@example.com', primary: true, verified: true },
        ],
      });

      const { state } = service.getAuthorizationUrl('github');
      const result = await service.handleCallback('github', 'auth-code', state);

      expect(result.email).toBe('test@example.com');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.github.com/user/emails',
        expect.any(Object)
      );
    });

    it('should handle Google callback successfully', async () => {
      // Mock token exchange
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'google-access-token',
          refresh_token: 'google-refresh-token',
        },
      });

      // Mock user info
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 'google-user-id',
          name: 'Test User',
          email: 'test@gmail.com',
          picture: 'https://picture.url',
        },
      });

      const { state } = service.getAuthorizationUrl('google');
      const result = await service.handleCallback('google', 'auth-code', state);

      expect(result).toEqual({
        provider: 'google',
        providerId: 'google-user-id',
        email: 'test@gmail.com',
        name: 'Test User',
        avatarUrl: 'https://picture.url',
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token',
      });
    });

    it('should throw error for invalid state', async () => {
      await expect(
        service.handleCallback('github', 'auth-code', 'invalid-state')
      ).rejects.toThrow(OAuthError);

      await expect(
        service.handleCallback('github', 'auth-code', 'invalid-state')
      ).rejects.toThrow(OAuthErrorType.INVALID_STATE);
    });

    it('should throw error when token exchange fails', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'invalid_grant' } },
      });

      const { state } = service.getAuthorizationUrl('github');

      await expect(
        service.handleCallback('github', 'auth-code', state)
      ).rejects.toThrow(OAuthError);

      await expect(
        service.handleCallback('github', 'auth-code', state)
      ).rejects.toThrow(OAuthErrorType.TOKEN_EXCHANGE_FAILED);
    });

    it('should throw error when user info fetch fails', async () => {
      // Mock token exchange success
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'github-access-token',
        },
      });

      // Mock user info failure
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { error: 'unauthorized' } },
      });

      const { state } = service.getAuthorizationUrl('github');

      await expect(
        service.handleCallback('github', 'auth-code', state)
      ).rejects.toThrow(OAuthError);

      await expect(
        service.handleCallback('github', 'auth-code', state)
      ).rejects.toThrow(OAuthErrorType.USER_INFO_FAILED);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh Google access token', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'new-access-token',
        },
      });

      const newToken = await service.refreshAccessToken('google', 'refresh-token');

      expect(newToken).toBe('new-access-token');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          refresh_token: 'refresh-token',
          grant_type: 'refresh_token',
        }),
        expect.any(Object)
      );
    });

    it('should throw error when refresh fails', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { error: 'invalid_grant' } },
      });

      await expect(
        service.refreshAccessToken('google', 'invalid-token')
      ).rejects.toThrow(OAuthError);
    });
  });

  describe('Error handling', () => {
    it('should handle missing email from GitHub', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      });

      mockedAxios.get
        .mockResolvedValueOnce({
          data: { id: 123, login: 'user', email: null },
        })
        .mockRejectedValueOnce(new Error('API error'));

      const { state } = service.getAuthorizationUrl('github');

      await expect(
        service.handleCallback('github', 'code', state)
      ).rejects.toThrow('Unable to get email from GitHub');
    });

    it('should handle missing email from Google', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'token' },
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: { id: '123', name: 'User' }, // No email
      });

      const { state } = service.getAuthorizationUrl('google');

      await expect(
        service.handleCallback('google', 'code', state)
      ).rejects.toThrow('Unable to get email from Google');
    });
  });
});
