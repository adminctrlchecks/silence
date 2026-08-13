import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

/** In-memory fake of the PrismaService slice AuthService uses. */
function makeFakePrisma() {
  const users: any[] = [];
  const admins: any[] = [];
  let seq = 0;
  return {
    _users: users,
    _admins: admins,
    admin: {
      findUnique: async ({ where }: any) => admins.find((a) => a.email === where.email) ?? null,
    },
    user: {
      findUnique: async ({ where }: any) =>
        users.find((u) => (where.contact ? u.contact === where.contact : u.id === where.id)) ?? null,
      create: async ({ data }: any) => {
        const u = { id: `u_${++seq}`, ...data };
        users.push(u);
        return u;
      },
    },
  };
}

const REGISTER = {
  name: 'Asha',
  category: 'female' as const,
  dob: '1998-04-21',
  timeOfBirth: '07:35',
  placeOfBirth: { city: 'Chennai', country: 'IN' },
  contact: 'asha@example.com',
  password: 'super-secret-1',
  lang: 'en',
  consent: true as const,
};

describe('AuthService', () => {
  const jwt = new JwtService({});
  process.env.JWT_USER_SECRET = 'test-user-secret';
  process.env.JWT_ADMIN_SECRET = 'test-admin-secret';

  it('hashes the password on registration (never stores plaintext)', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as never, jwt);
    const res = await auth.userRegister(REGISTER);
    expect(res.token).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    const stored = prisma._users[0];
    expect(stored.passwordHash).toBeDefined();
    expect(stored.passwordHash).not.toBe(REGISTER.password);
    expect(await bcrypt.compare(REGISTER.password, stored.passwordHash)).toBe(true);
  });

  it('rejects login with a wrong password', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as never, jwt);
    await auth.userRegister(REGISTER);
    await expect(
      auth.userLogin({ contact: REGISTER.contact, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts login with the correct password and returns tokens', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as never, jwt);
    await auth.userRegister(REGISTER);
    const res = await auth.userLogin({ contact: REGISTER.contact, password: REGISTER.password });
    expect(res.token).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    const payload: any = jwt.verify(res.token, { secret: process.env.JWT_USER_SECRET });
    expect(payload.role).toBe('user');
    expect(payload.typ).toBe('access');
  });

  it('rejects duplicate registration for the same contact', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as never, jwt);
    await auth.userRegister(REGISTER);
    await expect(auth.userRegister(REGISTER)).rejects.toBeInstanceOf(ConflictException);
  });

  it('exchanges a valid refresh token for a new access token', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as never, jwt);
    const { refreshToken } = await auth.userRegister(REGISTER);
    const refreshed = await auth.refresh('user', refreshToken);
    expect(refreshed.token).toBeTruthy();
    const payload: any = jwt.verify(refreshed.token, { secret: process.env.JWT_USER_SECRET });
    expect(payload.typ).toBe('access');
  });

  it('rejects an access token used as a refresh token', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as never, jwt);
    const { token } = await auth.userRegister(REGISTER);
    await expect(auth.refresh('user', token)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
