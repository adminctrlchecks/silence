import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { AdminLoginInput, UserRegisterInput, UserLoginInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';

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
    const token = await this.jwt.signAsync(
      { sub: admin.id, role: 'admin', email: admin.email },
      {
        secret: process.env.JWT_ADMIN_SECRET,
        expiresIn: (process.env.JWT_ADMIN_EXPIRES_IN ?? '12h') as never,
      },
    );
    return { token, admin: { id: admin.id, name: admin.name } };
  }

  async userRegister(input: UserRegisterInput) {
    const existing = await this.prisma.user.findUnique({ where: { contact: input.contact } });
    if (existing) throw new ConflictException('A user with this contact already exists');

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
        lang: input.lang,
        consent: input.consent,
      },
    });
    return { token: await this.signUser(user.id), user: { id: user.id, name: user.name, category: user.category } };
  }

  async userLogin(input: UserLoginInput) {
    const user = await this.prisma.user.findUnique({ where: { contact: input.contact } });
    if (!user) throw new UnauthorizedException('User not found');
    // NOTE: passwordless-by-contact for now (see REQUIREMENTS — users provide details,
    // not necessarily a password). Add password verification here if/when introduced.
    return { token: await this.signUser(user.id), user: { id: user.id, name: user.name, category: user.category } };
  }

  private signUser(userId: string) {
    return this.jwt.signAsync(
      { sub: userId, role: 'user' },
      {
        secret: process.env.JWT_USER_SECRET,
        expiresIn: (process.env.JWT_USER_EXPIRES_IN ?? '7d') as never,
      },
    );
  }
}
