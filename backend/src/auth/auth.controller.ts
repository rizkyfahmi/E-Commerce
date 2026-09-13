import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
  Headers,
  Ip,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { SecurityService } from './security.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    private readonly securityService: SecurityService,
  ) {}

  private extractDeviceInfo(req: any, userAgent?: string, ip?: string) {
    const ua = userAgent || req.headers['user-agent'] || 'Web Browser';
    let browser = 'Web Browser';
    let os = 'Windows/Linux/macOS';
    let device = 'Desktop';

    if (/mobile/i.test(ua)) device = 'Smartphone / HP';
    if (/tablet|ipad/i.test(ua)) device = 'Tablet';
    if (/chrome/i.test(ua)) browser = 'Google Chrome';
    else if (/safari/i.test(ua)) browser = 'Apple Safari';
    else if (/firefox/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/edg/i.test(ua)) browser = 'Microsoft Edge';

    if (/windows/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad/i.test(ua)) os = 'iOS';
    else if (/macintosh|mac os/i.test(ua)) os = 'macOS';

    return {
      browser,
      os,
      device,
      ip: ip || req.ip || '127.0.0.1',
    };
  }

  // =========================================================================
  // 1. LOGIN & REGISTER
  // =========================================================================
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
    @Headers('user-agent') ua: string,
    @Ip() ip: string,
  ) {
    const deviceInfo = this.extractDeviceInfo(req, ua, ip);
    return this.authService.login(loginDto, deviceInfo);
  }

  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
    @Req() req: any,
    @Headers('user-agent') ua: string,
    @Ip() ip: string,
  ) {
    const deviceInfo = this.extractDeviceInfo(req, ua, ip);
    return this.authService.register(registerDto, deviceInfo);
  }

  // =========================================================================
  // 2. PHONE NUMBER + OTP FLOW
  // =========================================================================
  @Post('otp/send')
  sendPhoneOtp(@Body('phone') phone: string) {
    return this.authService.requestPhoneOtp(phone);
  }

  @Post('otp/login')
  verifyPhoneOtpAndLogin(
    @Body('phone') phone: string,
    @Body('otp') otp: string,
    @Req() req: any,
    @Headers('user-agent') ua: string,
    @Ip() ip: string,
  ) {
    const deviceInfo = this.extractDeviceInfo(req, ua, ip);
    return this.authService.verifyPhoneOtpAndLogin(phone, otp, deviceInfo);
  }

  // =========================================================================
  // 3. FORGOT PASSWORD FLOW
  // =========================================================================
  @Post('forgot-password/request')
  forgotPasswordRequest(@Body('identifier') identifier: string) {
    return this.authService.forgotPasswordRequest(identifier);
  }

  @Post('forgot-password/reset')
  forgotPasswordReset(
    @Body('target') target: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.forgotPasswordReset(target, code, newPassword);
  }

  // =========================================================================
  // 4. OAUTH & SOCIAL LOGIN
  // =========================================================================
  @Get('oauth/providers')
  getProvidersStatus() {
    return this.oauthService.getProvidersStatus();
  }

  @Get('oauth/:provider/url')
  getOAuthUrl(@Param('provider') provider: string) {
    return this.oauthService.getAuthUrl(provider);
  }

  @Post('social-login')
  socialLogin(
    @Body() socialDto: SocialLoginDto,
    @Req() req: any,
    @Headers('user-agent') ua: string,
    @Ip() ip: string,
  ) {
    const deviceInfo = this.extractDeviceInfo(req, ua, ip);
    return this.authService.socialLogin(socialDto, deviceInfo);
  }

  // =========================================================================
  // 5. SECURITY SETTINGS & SESSIONS (PROTECTED)
  // =========================================================================
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('security/methods')
  getLoginMethods(@Req() req: any) {
    return this.securityService.getLoginMethods(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('security/link')
  linkProvider(
    @Req() req: any,
    @Body('provider') provider: string,
    @Body('providerAccountId') providerAccountId: string,
    @Body('providerEmail') providerEmail?: string,
  ) {
    return this.securityService.linkProvider(req.user.sub, provider, providerAccountId, providerEmail);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('security/unlink/:provider')
  unlinkProvider(@Req() req: any, @Param('provider') provider: string) {
    return this.securityService.unlinkProvider(req.user.sub, provider);
  }

  @UseGuards(JwtAuthGuard)
  @Get('security/sessions')
  getSessions(@Req() req: any) {
    return this.securityService.getActiveSessions(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('security/sessions/:id')
  revokeSession(@Req() req: any, @Param('id') id: string) {
    return this.securityService.revokeSession(req.user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('security/sessions/logout-all')
  logoutAllDevices(@Req() req: any) {
    return this.securityService.logoutAllDevices(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('security/activity')
  getLoginActivity(@Req() req: any) {
    return this.securityService.getLoginActivities(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('security/2fa/setup')
  setup2FA(@Req() req: any) {
    return this.securityService.setup2FA(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('security/2fa/enable')
  enable2FA(@Req() req: any, @Body('code') code: string) {
    return this.securityService.enable2FA(req.user.sub, code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('security/2fa/disable')
  disable2FA(@Req() req: any, @Body('password') password: string) {
    return this.securityService.disable2FA(req.user.sub, password);
  }
}
