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
      findUnique: async ({ where }: any) =>
        admins.find((a) => (where.email ? a.email === where.email : a.id === where.id)) ?? null,
      update: async ({ where, data }: any) => {
        const admin = admins.find((a) => a.id === where.id);
        Object.assign(admin, data);
        return admin;
      },
    },
    user: {
      findUnique: async ({ where }: any) =>
        users.find((u) => (where.contact ? u.contact === where.contact : u.id === where.id)) ?? null,
      create: async ({ data }: any) => {
        const u = { id: `u_${++seq}`, ...data };
        users.push(u);
        return u;
      },
      update: async ({ where, data }: any) => {
        const user = users.find((u) => u.id === where.id);
        Object.assign(user, data);
        return user;
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

  it('accepts admin login with a bcrypt password and returns admin tokens', async () => {
    const prisma = makeFakePrisma();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const auth = new AuthService(prisma as never, jwt);

    const res = await auth.adminLogin({ email: 'admin@example.com', password: 'admin-secret' });

    expect(res.admin).toEqual({ id: 'admin_1', name: 'Admin' });
    expect(res.token).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    const payload: any = jwt.verify(res.token, { secret: process.env.JWT_ADMIN_SECRET });
    expect(payload).toMatchObject({ sub: 'admin_1', role: 'admin', typ: 'access', email: 'admin@example.com' });
  });

  it('rejects admin login with invalid credentials', async () => {
    const prisma = makeFakePrisma();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const auth = new AuthService(prisma as never, jwt);

    await expect(
      auth.adminLogin({ email: 'admin@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

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

  it('changes a user password after verifying the current password', async () => {
    const prisma = makeFakePrisma();
    const auth = new AuthService(prisma as never, jwt);
    const registered = await auth.userRegister(REGISTER);
    const payload: any = jwt.verify(registered.token, { secret: process.env.JWT_USER_SECRET });

    await expect(
      auth.changeUserPassword(payload.sub, {
        currentPassword: 'wrong-password',
        newPassword: 'new-secret-1',
        confirmPassword: 'new-secret-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await expect(
      auth.changeUserPassword(payload.sub, {
        currentPassword: REGISTER.password,
        newPassword: 'new-secret-1',
        confirmPassword: 'new-secret-1',
      }),
    ).resolves.toEqual({ changed: true });
    await expect(auth.userLogin({ contact: REGISTER.contact, password: REGISTER.password })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(auth.userLogin({ contact: REGISTER.contact, password: 'new-secret-1' })).resolves.toHaveProperty(
      'token',
    );
  });

  it('changes an admin password after verifying the current password', async () => {
    const prisma = makeFakePrisma();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const auth = new AuthService(prisma as never, jwt);

    await expect(
      auth.changeAdminPassword('admin_1', {
        currentPassword: 'bad-secret',
        newPassword: 'new-admin-secret',
        confirmPassword: 'new-admin-secret',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await expect(
      auth.changeAdminPassword('admin_1', {
        currentPassword: 'admin-secret',
        newPassword: 'new-admin-secret',
        confirmPassword: 'new-admin-secret',
      }),
    ).resolves.toEqual({ changed: true });
    await expect(
      auth.adminLogin({ email: 'admin@example.com', password: 'admin-secret' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(auth.adminLogin({ email: 'admin@example.com', password: 'new-admin-secret' })).resolves.toHaveProperty(
      'token',
    );
  });

  it('lets an admin use their admin credentials to enter the user app', async () => {
    const prisma = makeFakePrisma();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const auth = new AuthService(prisma as never, jwt);

    const firstLogin = await auth.userLogin({ contact: 'admin@example.com', password: 'admin-secret' });
    expect(firstLogin.user).toMatchObject({ name: 'Admin', category: 'other' });
    expect(prisma._users).toHaveLength(1);
    expect(prisma._users[0]).toMatchObject({
      contact: 'admin@example.com',
      placeCity: 'New Delhi',
      consent: true,
    });

    const secondLogin = await auth.adminUserSession('admin_1');
    expect(secondLogin.user.id).toBe(firstLogin.user.id);
    expect(prisma._users).toHaveLength(1);
  });
});
