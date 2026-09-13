import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { SecurityService } from './security.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { ALL_CATEGORIES_WITH_PRODUCTS } from '../seed-data';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private securityService: SecurityService,
  ) {}

  // =========================================================================
  // 1. LOGIN DENGAN EMAIL / TELEPON / USERNAME + PASSWORD
  // =========================================================================
  async login(loginDto: LoginDto, deviceInfo?: { browser?: string; os?: string; device?: string; ip?: string }) {
    const identifier = loginDto.identifier.trim();

    // Find user by phone, email, or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() },
        ],
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException(
        'Email / nomor telepon atau kata sandi tidak sesuai.',
      );
    }

    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordMatch) {
      if (user) {
        await this.securityService.logActivity(user.id, 'LOGIN_FAILED', 'Percobaan kata sandi salah', deviceInfo?.ip, deviceInfo?.device);
      }
      throw new UnauthorizedException('Email / nomor telepon atau kata sandi tidak sesuai.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // Record session & login activity
    await this.securityService.recordSession(user.id, accessToken.slice(-16), deviceInfo || {});
    await this.securityService.logActivity(user.id, 'LOGIN_SUCCESS', 'Login berhasil via Email/Password', deviceInfo?.ip, deviceInfo?.device);

    return {
      message: 'Login berhasil',
      access_token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    };
  }

  // =========================================================================
  // 2. LOGIN DENGAN NOMOR TELEPON + OTP (PHONE + OTP FLOW)
  // =========================================================================
  async requestPhoneOtp(phone: string) {
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new BadRequestException('Nomor telepon tidak valid.');
    }

    return this.otpService.sendOtp(cleanPhone, 'PHONE_OTP');
  }

  async verifyPhoneOtpAndLogin(phone: string, otp: string, deviceInfo?: { browser?: string; os?: string; device?: string; ip?: string }) {
    const cleanPhone = phone.trim();

    // Verify OTP (Single-use, max attempts, expiry validated)
    await this.otpService.verifyOtp(cleanPhone, otp, 'PHONE_OTP');

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      // Auto register phone user
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = `user${cleanPhone.slice(-4)}${randomSuffix}`;

      user = await this.prisma.user.create({
        data: {
          fullName: `User ${cleanPhone.slice(-4)}`,
          username,
          phone: cleanPhone,
          role: Role.CUSTOMER,
          isVerified: true,
          phoneVerifiedAt: new Date(),
          provider: 'PHONE',
        },
      });
    } else {
      // Update phone verification status
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerifiedAt: user.phoneVerifiedAt || new Date(),
          isVerified: true,
        },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.securityService.recordSession(user.id, accessToken.slice(-16), deviceInfo || {});
    await this.securityService.logActivity(user.id, 'LOGIN_SUCCESS', 'Login berhasil via Nomor Telepon & OTP', deviceInfo?.ip, deviceInfo?.device);

    return {
      message: 'Login dengan nomor telepon berhasil',
      access_token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  // =========================================================================
  // 3. REGISTER AKUN BARU
  // =========================================================================
  async register(registerDto: RegisterDto, deviceInfo?: { browser?: string; os?: string; device?: string; ip?: string }) {
    const { fullName, phone, email, password, role } = registerDto;

    if (!phone && !email) {
      throw new BadRequestException('Nomor telepon atau email wajib diisi.');
    }

    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: phone.trim() },
      });
      if (existingPhone) {
        throw new ConflictException('Nomor telepon sudah terdaftar. Silakan login.');
      }
    }

    if (email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (existingEmail) {
        throw new ConflictException('Email sudah terdaftar. Silakan login.');
      }
    }

    const baseUsername = (fullName || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${baseUsername || 'user'}${randomSuffix}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: fullName.trim(),
        username,
        phone: phone ? phone.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        password: hashedPassword,
        role: role === Role.SELLER ? Role.SELLER : Role.CUSTOMER,
        isVerified: true,
        emailVerifiedAt: email ? new Date() : null,
        phoneVerifiedAt: phone ? new Date() : null,
        provider: 'LOCAL',
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.securityService.recordSession(user.id, accessToken.slice(-16), deviceInfo || {});
    await this.securityService.logActivity(user.id, 'REGISTER_SUCCESS', 'Pendaftaran akun baru berhasil', deviceInfo?.ip, deviceInfo?.device);

    return {
      message: 'Registrasi berhasil',
      access_token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  // =========================================================================
  // 4. FORGOT PASSWORD (EMAIL / TELEPON RECOVERY)
  // =========================================================================
  async forgotPasswordRequest(identifier: string) {
    const cleanId = identifier.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId.toLowerCase() },
          { phone: cleanId },
          { username: cleanId.toLowerCase() },
        ],
      },
    });

    if (!user) {
      // Don't leak if user exists or not, but return friendly response
      return {
        message: 'Jika akun terdaftar, kode verifikasi pemulihan kata sandi telah dikirimkan.',
      };
    }

    const target = user.email || user.phone || cleanId;
    return this.otpService.sendOtp(target, 'FORGOT_PASSWORD_OTP');
  }

  async forgotPasswordReset(target: string, code: string, newPassword: string) {
    const cleanTarget = target.trim();

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Kata sandi baru minimal 6 karakter.');
    }

    // Verify OTP
    await this.otpService.verifyOtp(cleanTarget, code, 'FORGOT_PASSWORD_OTP');

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanTarget.toLowerCase() },
          { phone: cleanTarget },
          { username: cleanTarget.toLowerCase() },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('Akun pengguna tidak ditemukan.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Revoke all existing sessions for security
    await this.securityService.logoutAllDevices(user.id);
    await this.securityService.logActivity(user.id, 'PASSWORD_CHANGED', 'Kata sandi berhasil diperbarui via pemulihan akun');

    return {
      message: 'Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru Anda.',
    };
  }

  // =========================================================================
  // 5. SOCIAL LOGIN WITH ACCOUNT LINKING
  // =========================================================================
  async socialLogin(socialDto: SocialLoginDto, deviceInfo?: { browser?: string; os?: string; device?: string; ip?: string }) {
    const { provider, email, name, avatar, providerId } = socialDto;

    if (!provider) {
      throw new BadRequestException('Provider wajib diisi.');
    }

    // 1. Check if AuthAccount already linked
    let authAccount = providerId
      ? await this.prisma.authAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider,
              providerAccountId: providerId,
            },
          },
          include: { user: true },
        })
      : null;

    let user: any = authAccount?.user;

    // 2. If not found by AuthAccount, check existing User by email (Account Linking)
    if (!user && email) {
      user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (user && providerId) {
        // Link social account to existing user
        await this.securityService.linkProvider(user.id, provider, providerId, email);
      }
    }

    // 3. If still not found, create new user
    if (!user) {
      const baseUsername = (name || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 15);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = `${baseUsername || 'social'}${randomSuffix}`;

      user = await this.prisma.user.create({
        data: {
          fullName: name || `${provider} User`,
          username,
          email: email ? email.toLowerCase() : null,
          avatar: avatar || null,
          provider,
          providerId: providerId || null,
          role: Role.CUSTOMER,
          isVerified: true,
          emailVerifiedAt: email ? new Date() : null,
        },
      });

      if (providerId) {
        await this.prisma.authAccount.create({
          data: {
            userId: user.id,
            provider,
            providerAccountId: providerId,
            providerEmail: email || null,
          },
        });
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.securityService.recordSession(user.id, accessToken.slice(-16), deviceInfo || {});
    await this.securityService.logActivity(user.id, 'LOGIN_SUCCESS', `Login berhasil via ${provider}`, deviceInfo?.ip, deviceInfo?.device);

    return {
      message: `Login dengan ${provider} berhasil`,
      access_token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async resetDatabaseAndSeed() {
    // 1. Reset all transaction and user interaction data
    await this.prisma.orderItem.deleteMany({});
    await this.prisma.order.deleteMany({});
    await this.prisma.review.deleteMany({});
    await this.prisma.cart.deleteMany({});
    await this.prisma.wishlist.deleteMany({});

    // 2. Delete all existing products
    await this.prisma.product.deleteMany({});

    // 3. Ensure Seller account exists
    let seller = await this.prisma.user.findFirst({
      where: { role: Role.SELLER },
    });

    if (!seller) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      seller = await this.prisma.user.create({
        data: {
          fullName: 'Official Tech Store',
          username: 'officialtech',
          email: 'seller@eshop.com',
          phone: '08222222222',
          password: hashedPassword,
          role: Role.SELLER,
          isVerified: true,
        },
      });
    }

    // 4. Upsert categories & products
    let totalProductsCreated = 0;
    for (const item of ALL_CATEGORIES_WITH_PRODUCTS) {
      let category = await this.prisma.category.findFirst({
        where: {
          OR: [
            { name: item.category.name },
            { name: item.category.name.replace(' & TV', '') },
            { name: item.category.name.replace('Penyimpanan Data', 'Penyimpanan') },
          ],
        },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: item.category.name,
            description: item.category.description,
            icon: item.category.icon,
            isActive: true,
          },
        });
      } else {
        category = await this.prisma.category.update({
          where: { id: category.id },
          data: {
            name: item.category.name,
            description: item.category.description,
            icon: item.category.icon,
            isActive: true,
          },
        });
      }

      for (const prod of item.products) {
        await this.prisma.product.create({
          data: {
            name: prod.name,
            description: prod.description,
            price: prod.price,
            stock: prod.stock,
            image: prod.image,
            categoryId: category.id,
            sellerId: seller.id,
          },
        });
        totalProductsCreated++;
      }
    }

    return {
      message: 'Database berhasil direset. Semua data pembelian dikosongkan dan produk baru ditambahkan (3 produk per kategori).',
      totalCategories: ALL_CATEGORIES_WITH_PRODUCTS.length,
      totalProducts: totalProductsCreated,
      sellerId: seller.id,
    };
  }
}
