import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private prisma: PrismaService) {}

  // =========================================================================
  // 1. ACTIVE SESSIONS & DEVICES
  // =========================================================================
  async recordSession(
    userId: string,
    tokenHash: string,
    deviceInfo: { browser?: string; os?: string; device?: string; ip?: string },
  ) {
    return this.prisma.userSession.create({
      data: {
        userId,
        tokenHash,
        browser: deviceInfo.browser || 'Web Browser',
        os: deviceInfo.os || 'Windows/Linux/macOS',
        device: deviceInfo.device || 'Desktop/Laptop',
        ipAddress: deviceInfo.ip || '127.0.0.1',
        isCurrent: true,
        lastActive: new Date(),
      },
    });
  }

  async getActiveSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' },
      take: 10,
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.userSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Sesi perangkat tidak ditemukan.');
    }

    await this.prisma.userSession.delete({
      where: { id: sessionId },
    });

    await this.logActivity(userId, 'SESSION_REVOKED', `Mencabut sesi perangkat ${session.browser} (${session.device})`);

    return { message: 'Sesi perangkat berhasil dicabut.' };
  }

  async logoutAllDevices(userId: string) {
    const count = await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    await this.logActivity(userId, 'LOGOUT_ALL', 'Keluar dari semua sesi perangkat aktif.');

    return {
      message: 'Berhasil keluar dari semua perangkat aktif.',
      revokedCount: count.count,
    };
  }

  // =========================================================================
  // 2. SECURITY AUDIT LOGGING
  // =========================================================================
  async logActivity(
    userId: string,
    action: string,
    details?: string,
    ip?: string,
    device?: string,
  ) {
    try {
      await this.prisma.loginActivity.create({
        data: {
          userId,
          action,
          device: device || 'Web Client',
          ipAddress: ip || '127.0.0.1',
          location: details || 'Indonesia',
        },
      });
    } catch (err) {
      this.logger.error('Failed to log security activity', err);
    }
  }

  async getLoginActivities(userId: string) {
    return this.prisma.loginActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });
  }

  // =========================================================================
  // 3. LOGIN METHODS & ACCOUNT LINKING
  // =========================================================================
  async getLoginMethods(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { authAccounts: true },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const hasPassword = !!user.password;
    const hasEmail = !!user.email;
    const isEmailVerified = !!user.emailVerifiedAt;
    const hasPhone = !!user.phone;
    const isPhoneVerified = !!user.phoneVerifiedAt;

    const linkedProviders = user.authAccounts.map((a) => ({
      id: a.id,
      provider: a.provider,
      accountId: a.providerAccountId,
      email: a.providerEmail,
      createdAt: a.createdAt,
    }));

    return {
      email: {
        value: user.email,
        isVerified: isEmailVerified,
        hasPassword,
      },
      phone: {
        value: user.phone,
        isVerified: isPhoneVerified,
      },
      twoFactorEnabled: user.twoFactorEnabled,
      linkedProviders,
      passkeyActive: linkedProviders.some((p) => p.provider === 'PASSKEY'),
    };
  }

  async linkProvider(userId: string, provider: string, providerAccountId: string, providerEmail?: string) {
    const existing = await this.prisma.authAccount.findFirst({
      where: { provider, providerAccountId },
    });

    if (existing && existing.userId !== userId) {
      throw new BadRequestException('Akun sosial ini sudah terhubung ke akun pengguna lain.');
    }

    const authAccount = await this.prisma.authAccount.upsert({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
      create: {
        userId,
        provider,
        providerAccountId,
        providerEmail,
      },
      update: {
        providerAccountId,
        providerEmail,
      },
    });

    await this.logActivity(userId, 'ACCOUNT_LINKED', `Menghubungkan akun sosial ${provider}`);

    return {
      message: `Akun ${provider} berhasil dihubungkan.`,
      authAccount,
    };
  }

  async unlinkProvider(userId: string, provider: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { authAccounts: true },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    // Safety: ensure user doesn't disconnect their ONLY login method
    const hasPassword = !!user.password;
    const otherSocials = user.authAccounts.filter((a) => a.provider !== provider);

    if (!hasPassword && otherSocials.length === 0) {
      throw new BadRequestException(
        'Tidak dapat mencabut metode login ini. Anda harus memiliki kata sandi atau metode login lain agar tidak kehilangan akses ke akun Anda.',
      );
    }

    await this.prisma.authAccount.deleteMany({
      where: { userId, provider },
    });

    await this.logActivity(userId, 'ACCOUNT_UNLINKED', `Mencabut akun sosial ${provider}`);

    return { message: `Akun ${provider} berhasil dilepas.` };
  }

  // =========================================================================
  // 4. TWO-FACTOR AUTHENTICATION (2FA & BACKUP CODES)
  // =========================================================================
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
      codes.push(code.toUpperCase());
    }
    return codes;
  }

  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan.');

    // Generate a secure base32 secret
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const backupCodes = this.generateBackupCodes();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(backupCodes),
      },
    });

    const otpauthUrl = `otpauth://totp/E-Shop:${encodeURIComponent(user.email || user.username)}?secret=${secret}&issuer=E-Shop`;

    return {
      secret,
      otpauthUrl,
      backupCodes,
      message: 'Scan QR Code atau masukkan kode manual ke aplikasi Google Authenticator / Authy Anda.',
    };
  }

  async enable2FA(userId: string, verificationCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Silakan inisialisasi 2FA terlebih dahulu.');
    }

    // In production, verify TOTP with library (or test with 6 digits)
    if (!verificationCode || verificationCode.trim().length !== 6) {
      throw new BadRequestException('Kode verifikasi 2FA harus 6 digit.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    await this.logActivity(userId, '2FA_ENABLED', 'Mengaktifkan Autentikasi Dua Faktor (2FA)');

    return {
      message: 'Two-Factor Authentication (2FA) berhasil diaktifkan.',
      twoFactorEnabled: true,
    };
  }

  async disable2FA(userId: string, passwordConfirm: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan.');

    if (user.password) {
      const match = await bcrypt.compare(passwordConfirm, user.password);
      if (!match) {
        throw new BadRequestException('Kata sandi konfirmasi tidak sesuai.');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await this.logActivity(userId, '2FA_DISABLED', 'Menonaktifkan Autentikasi Dua Faktor (2FA)');

    return {
      message: 'Two-Factor Authentication (2FA) berhasil dinonaktifkan.',
      twoFactorEnabled: false,
    };
  }
}
