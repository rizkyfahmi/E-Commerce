import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OAuthProviderStatus {
  id: 'google' | 'facebook' | 'apple' | 'microsoft' | 'github' | 'passkey';
  name: string;
  isConfigured: boolean;
  type: 'OAUTH' | 'WEBAUTHN' | 'LOCAL';
  description: string;
  authUrl?: string;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(private prisma: PrismaService) {}

  // Returns actual configuration status of all OAuth and security providers
  getProvidersStatus(): OAuthProviderStatus[] {
    const googleConfigured = !!(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    );
    const facebookConfigured = !!(
      process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET
    );
    const appleConfigured = !!(
      process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID
    );
    const microsoftConfigured = !!(
      process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
    );
    const githubConfigured = !!(
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    );

    return [
      {
        id: 'google',
        name: 'Google',
        type: 'OAUTH',
        isConfigured: googleConfigured,
        description: googleConfigured
          ? 'Siap digunakan (Google Cloud OAuth 2.0)'
          : 'Konfigurasi Google Client ID & Secret di .env backend',
        authUrl: googleConfigured ? this.generateGoogleUrl() : undefined,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        type: 'OAUTH',
        isConfigured: facebookConfigured,
        description: facebookConfigured
          ? 'Siap digunakan (Meta Graph OAuth)'
          : 'Konfigurasi Facebook App ID & App Secret di .env backend',
        authUrl: facebookConfigured ? this.generateFacebookUrl() : undefined,
      },
      {
        id: 'apple',
        name: 'Apple',
        type: 'OAUTH',
        isConfigured: appleConfigured,
        description: appleConfigured
          ? 'Siap digunakan (Sign in with Apple)'
          : 'Konfigurasi Apple Service ID & Key di .env backend',
        authUrl: appleConfigured ? this.generateAppleUrl() : undefined,
      },
      {
        id: 'microsoft',
        name: 'Microsoft',
        type: 'OAUTH',
        isConfigured: microsoftConfigured,
        description: microsoftConfigured
          ? 'Siap digunakan (Microsoft Entra ID)'
          : 'Konfigurasi Microsoft Client ID & Secret di .env backend',
        authUrl: microsoftConfigured ? this.generateMicrosoftUrl() : undefined,
      },
      {
        id: 'github',
        name: 'GitHub',
        type: 'OAUTH',
        isConfigured: githubConfigured,
        description: githubConfigured
          ? 'Siap digunakan (GitHub OAuth App)'
          : 'Konfigurasi GitHub Client ID & Secret di .env backend',
        authUrl: githubConfigured ? this.generateGithubUrl() : undefined,
      },
      {
        id: 'passkey',
        name: 'Passkey / Biometric',
        type: 'WEBAUTHN',
        isConfigured: true,
        description: 'WebAuthn / FIDO2 Authentication (Fingerprint, Face ID, Windows Hello)',
      },
    ];
  }

  // Official Authorization URLs
  private generateGoogleUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const redirectUri =
      process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/oauth/google/callback';
    const scope = encodeURIComponent('openid profile email');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  }

  private generateFacebookUrl(): string {
    const appId = process.env.FACEBOOK_APP_ID || '';
    const redirectUri =
      process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/oauth/facebook/callback';
    const scope = encodeURIComponent('email,public_profile');
    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${scope}&response_type=code`;
  }

  private generateAppleUrl(): string {
    const clientId = process.env.APPLE_CLIENT_ID || '';
    const redirectUri =
      process.env.APPLE_CALLBACK_URL || 'http://localhost:3000/auth/oauth/apple/callback';
    const scope = encodeURIComponent('name email');
    return `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_type=code%20id_token&scope=${scope}&response_mode=form_post`;
  }

  private generateMicrosoftUrl(): string {
    const clientId = process.env.MICROSOFT_CLIENT_ID || '';
    const redirectUri =
      process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3000/auth/oauth/microsoft/callback';
    const scope = encodeURIComponent('openid profile email User.Read');
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&response_mode=query&scope=${scope}`;
  }

  private generateGithubUrl(): string {
    const clientId = process.env.GITHUB_CLIENT_ID || '';
    const redirectUri =
      process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/oauth/github/callback';
    const scope = encodeURIComponent('read:user user:email');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${scope}`;
  }

  // Get URL for requested provider
  getAuthUrl(provider: string): { url: string; configured: boolean; message?: string } {
    const normalized = provider.toLowerCase();
    const statuses = this.getProvidersStatus();
    const target = statuses.find((s) => s.id === normalized);

    if (!target) {
      throw new BadRequestException(`Provider "${provider}" tidak didukung.`);
    }

    if (!target.isConfigured || !target.authUrl) {
      return {
        url: '',
        configured: false,
        message: `Provider ${target.name} belum dikonfigurasi di backend (.env). Silakan masukkan Client ID dan Secret yang sesuai.`,
      };
    }

    return {
      url: target.authUrl,
      configured: true,
    };
  }
}
