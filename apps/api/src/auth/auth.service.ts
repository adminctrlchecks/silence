import { randomBytes, createHash } from 'node:crypto';
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type {
  AdminLoginInput,
  ChangePasswordInput,
  UserRegisterInput,
  UserLoginInput,
  ResetPasswordInput,
} from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../integrations/email/email.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import { GoogleAuthService } from '../integrations/google/google-auth.service';
import type { User } from '@prisma/client';

type Role = 'admin' | 'user';

/**
 * Birth details + category are required for a reading, but Google gives us
 * none of that — a fresh Google sign-up is created with these left blank
 * (SessionsService.profileCompleteness already treats blank/untrimmed
 * strings as "missing", and ChartService now guards against generating a
 * chart from them) and the frontend routes the user to /profile to finish
 * onboarding before /app instead of into the reading flow.
 */
function isProfileComplete(user: User): boolean {
  return Boolean(
    user.dob?.trim() && user.timeOfBirth?.trim() && user.placeCity?.trim() && user.placeCountry?.trim() && user.consent,
  );
}

/** Reset links are valid for 1 hour. */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    private readonly audit: AdminAuditService,
    private readonly googleAuth: GoogleAuthService,
  ) {}

  async adminLogin(input: AdminLoginInput) {
    const admin = await this.prisma.admin.findUnique({ where: { email: input.email } });
    if (!admin || !(await bcrypt.compare(input.password, admin.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.audit.record({ adminId: admin.id, adminEmail: admin.email, action: 'admin_login' });
    return {
      ...(await this.issueTokens('admin', admin.id, { email: admin.email })),
      admin: { id: admin.id, name: admin.name },
    };
  }

  async userRegister(input: UserRegisterInput) {
    const existing = await this.prisma.user.findUnique({ where: { contact: input.contact } });
    if (existing) throw new ConflictException('A user with this contact already exists');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        category: input.category,
        dob: input.dob,
        timeOfBirth: input.timeOfBirth,
        placeCity: input.placeOfBirth.city,
        placeCountry: input.placeOfBirth.country,
        placeLat: input.placeOfBirth.lat,
        placeLng: input.placeOfBirth.lng,
        placeTimezone: input.placeOfBirth.timezone,
        contact: input.contact,
        passwordHash,
        lang: input.lang,
        consent: input.consent,
      },
    });
    return {
      ...(await this.issueTokens('user', user.id)),
      user: { id: user.id, name: user.name, category: user.category },
    };
  }

  async userLogin(input: UserLoginInput) {
    const user = await this.prisma.user.findUnique({ where: { contact: input.contact } });
    if (user?.passwordHash && (await bcrypt.compare(input.password, user.passwordHash))) {
      return {
        ...(await this.issueTokens('user', user.id)),
        user: { id: user.id, name: user.name, category: user.category },
      };
    }

    const admin = await this.prisma.admin.findUnique({ where: { email: input.contact } });
    if (admin && (await bcrypt.compare(input.password, admin.passwordHash))) {
      const linkedUser = user ?? (await this.createAdminUserProfile(admin));
      return {
        ...(await this.issueTokens('user', linkedUser.id)),
        user: { id: linkedUser.id, name: linkedUser.name, category: linkedUser.category },
      };
    }

    // Same generic message whether the contact or the password is wrong (no user enumeration).
    throw new UnauthorizedException('Invalid credentials');
  }

  /**
   * Google sign-in/sign-up: verifies the ID token, then finds-or-creates the
   * user. Matches an existing `googleId` first, then falls back to linking
   * an existing password account with the same email (so someone who
   * registered with email+password and later clicks "Continue with Google"
   * lands on the same account instead of a duplicate).
   */
  async userGoogleAuth(idToken: string, lang?: string) {
    const profile = await this.googleAuth.verifyIdToken(idToken);
    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    let user = await this.prisma.user.findUnique({ where: { googleId: profile.sub } });

    if (!user) {
      const existingByEmail = await this.prisma.user.findUnique({ where: { contact: profile.email } });
      user = existingByEmail
        ? await this.prisma.user.update({ where: { id: existingByEmail.id }, data: { googleId: profile.sub } })
        : await this.prisma.user.create({
            data: {
              name: profile.name ?? profile.email.split('@')[0],
              // A real category/birth details aren't known yet — 'other' is a
              // neutral placeholder the user corrects during onboarding, not a
              // real demographic claim (isProfileComplete() ignores category
              // and gates on birth details + consent instead).
              category: 'other',
              dob: '',
              timeOfBirth: '',
              placeCity: '',
              placeCountry: '',
              contact: profile.email,
              passwordHash: null,
              googleId: profile.sub,
              lang: lang ?? 'en',
              consent: false,
            },
          });
    }

    return {
      ...(await this.issueTokens('user', user.id)),
      user: { id: user.id, name: user.name, category: user.category },
      profileComplete: isProfileComplete(user),
    };
  }

  async changeAdminPassword(adminId: string, input: ChangePasswordInput) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin || !(await bcrypt.compare(input.currentPassword, admin.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash: await bcrypt.hash(input.newPassword, 10) },
    });
    await this.audit.record({ adminId: admin.id, adminEmail: admin.email, action: 'admin_password_change' });
    return { changed: true };
  }

  async changeUserPassword(userId: string, input: ChangePasswordInput) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash || !(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(input.newPassword, 10) },
    });
    return { changed: true };
  }

  /**
   * Forgot-password requests always resolve the same way whether or not the
   * contact/email is registered, so callers can never enumerate accounts.
   */
  async userForgotPassword(contact: string) {
    const user = await this.prisma.user.findUnique({ where: { contact } });
    if (user) await this.issueResetToken('user', user.id, user.contact);
    return { sent: true };
  }

  async adminForgotPassword(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (admin) await this.issueResetToken('admin', admin.id, admin.email);
    return { sent: true };
  }

  async userResetPassword(input: ResetPasswordInput) {
    const targetId = await this.consumeResetToken('user', input.token);
    await this.prisma.user.update({
      where: { id: targetId },
      data: { passwordHash: await bcrypt.hash(input.newPassword, 10) },
    });
    return { changed: true };
  }

  async adminResetPassword(input: ResetPasswordInput) {
    const targetId = await this.consumeResetToken('admin', input.token);
    const admin = await this.prisma.admin.update({
      where: { id: targetId },
      data: { passwordHash: await bcrypt.hash(input.newPassword, 10) },
    });
    await this.audit.record({ adminId: admin.id, adminEmail: admin.email, action: 'admin_password_reset' });
    return { changed: true };
  }

  private async issueResetToken(role: Role, targetId: string, to: string) {
    const token = randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        role,
        targetId,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const webOrigin = (process.env.WEB_ORIGIN ?? 'http://localhost:3011').split(',')[0].trim();
    const path = role === 'admin' ? '/admin/reset-password' : '/reset-password';
    await this.email.sendPasswordReset({ to, resetUrl: `${webOrigin}${path}?token=${token}`, role });
  }

  /** Validates + single-use-consumes a reset token, returning the Admin/User id it targets. */
  private async consumeResetToken(role: Role, token: string): Promise<string> {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash: this.hashToken(token) } });
    if (!record || record.role !== role || record.usedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    await this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    // Invalidate any other outstanding tokens for this target so an old email link can't be reused later.
    await this.prisma.passwordResetToken.updateMany({
      where: { role, targetId: record.targetId, usedAt: null, id: { not: record.id } },
      data: { usedAt: new Date() },
    });

    return record.targetId;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async adminUserSession(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new UnauthorizedException('Invalid admin session');

    const user =
      (await this.prisma.user.findUnique({ where: { contact: admin.email } })) ??
      (await this.createAdminUserProfile(admin));

    await this.audit.record({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'admin_impersonate_user',
      targetType: 'user',
      targetId: user.id,
    });

    return {
      // isAdminSession marks the issued token so the user app can show an impersonation banner.
      ...(await this.issueTokens('user', user.id, { isAdminSession: true })),
      user: { id: user.id, name: user.name, category: user.category },
    };
  }

  /** Exchange a valid refresh token for a fresh access token (+ rotated refresh token). */
  async refresh(role: Role, refreshToken: string) {
    const secret = this.secretFor(role);
    let payload: { sub: string; role: Role; typ?: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.typ !== 'refresh' || payload.role !== role || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(role, payload.sub);
  }

  private secretFor(role: Role): string {
    return (role === 'admin' ? process.env.JWT_ADMIN_SECRET : process.env.JWT_USER_SECRET) as string;
  }

  private createAdminUserProfile(admin: { email: string; name: string; passwordHash: string }) {
    return this.prisma.user.create({
      data: {
        name: admin.name,
        category: 'other',
        dob: '1990-01-01',
        timeOfBirth: '09:00',
        placeCity: 'New Delhi',
        placeCountry: 'IN',
        placeLat: 28.6139,
        placeLng: 77.209,
        placeTimezone: 'Asia/Kolkata',
        contact: admin.email,
        passwordHash: admin.passwordHash,
        lang: 'en',
        consent: true,
      },
    });
  }

  private async issueTokens(role: Role, sub: string, extra: Record<string, unknown> = {}) {
    const secret = this.secretFor(role);
    const accessExp =
      role === 'admin'
        ? (process.env.JWT_ADMIN_EXPIRES_IN ?? '12h')
        : (process.env.JWT_USER_EXPIRES_IN ?? '7d');
    const refreshExp =
      role === 'admin'
        ? (process.env.JWT_ADMIN_REFRESH_EXPIRES_IN ?? '30d')
        : (process.env.JWT_USER_REFRESH_EXPIRES_IN ?? '30d');

    const [token, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub, role, typ: 'access', ...extra }, { secret, expiresIn: accessExp as never }),
      this.jwt.signAsync({ sub, role, typ: 'refresh' }, { secret, expiresIn: refreshExp as never }),
    ]);
    return { token, refreshToken };
  }
}
