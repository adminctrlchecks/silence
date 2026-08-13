import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { AdminLoginInput, UserRegisterInput, UserLoginInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';

type Role = 'admin' | 'user';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async adminLogin(input: AdminLoginInput) {
    const admin = await this.prisma.admin.findUnique({ where: { email: input.email } });
    if (!admin || !(await bcrypt.compare(input.password, admin.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
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
    // Same generic message whether the contact or the password is wrong (no user enumeration).
    if (!user || !user.passwordHash || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      ...(await this.issueTokens('user', user.id)),
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
