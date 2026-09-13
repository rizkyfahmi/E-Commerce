import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private prisma: PrismaService) {}

  // Generate 6-digit numeric OTP
  private generateRandomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send or create OTP for phone or email
  async sendOtp(target: string, type: 'PHONE_OTP' | 'EMAIL_VERIFICATION' | 'FORGOT_PASSWORD_OTP') {
    const cleanTarget = target.trim();

    // Check rate limit: cooldown 60 seconds
    const recentToken = await this.prisma.verificationToken.findFirst({
      where: {
        target: cleanTarget,
        type,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000), // within last 60s
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentToken) {
      const remainingSec = Math.ceil(
        (recentToken.createdAt.getTime() + 60 * 1000 - Date.now()) / 1000,
      );
      throw new BadRequestException(
        `Silakan tunggu ${remainingSec} detik sebelum meminta kode OTP kembali.`,
      );
    }

    const code = this.generateRandomCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    const tokenRecord = await this.prisma.verificationToken.create({
      data: {
        target: cleanTarget,
        type,
        token: code,
        expiresAt,
        maxAttempts: 5,
      },
    });

    // In production, trigger SMS / WhatsApp Gateway / Email Provider
    const otpProvider = process.env.OTP_PROVIDER;
    if (otpProvider) {
      this.logger.log(`Dispatching OTP ${code} to ${cleanTarget} via ${otpProvider}`);
      // Integrate third-party SMS/WhatsApp API (Twilio, Zenziva, Fonnte, etc.)
    } else {
      this.logger.warn(
        `[DEV/TESTING] OTP generated for ${cleanTarget}: ${code} (Expires in 5 minutes)`,
      );
    }

    return {
      message: `Kode OTP verifikasi telah dikirimkan ke ${cleanTarget}`,
      expiresInSeconds: 300,
      cooldownSeconds: 60,
      tokenId: tokenRecord.id,
      // For development ease, include in dev response if no SMS gateway is configured
      devOtp: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  // Verify OTP token
  async verifyOtp(
    target: string,
    code: string,
    type: 'PHONE_OTP' | 'EMAIL_VERIFICATION' | 'FORGOT_PASSWORD_OTP',
  ) {
    const cleanTarget = target.trim();
    const cleanCode = code.trim();

    const tokenRecord = await this.prisma.verificationToken.findFirst({
      where: {
        target: cleanTarget,
        type,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Kode OTP tidak ditemukan atau telah kedaluwarsa.');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new BadRequestException('Kode OTP telah kedaluwarsa. Silakan minta kode baru.');
    }

    if (tokenRecord.attempts >= tokenRecord.maxAttempts) {
      throw new BadRequestException(
        'Batas maksimum percobaan OTP telah tercapai. Silakan minta kode baru.',
      );
    }

    if (tokenRecord.token !== cleanCode) {
      await this.prisma.verificationToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: tokenRecord.attempts + 1 },
      });
      const remaining = tokenRecord.maxAttempts - (tokenRecord.attempts + 1);
      throw new BadRequestException(
        `Kode OTP salah. Sisa percobaan: ${Math.max(0, remaining)} kali.`,
      );
    }

    // Mark as used (Single-use)
    await this.prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    return {
      verified: true,
      target: cleanTarget,
      type,
    };
  }
}
