import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

/** In-memory fake of the PrismaService slice AuthService uses. */
function makeFakePrisma() {
  const users: any[] = [];
  const admins: any[] = [];
  const resetTokens: any[] = [];
  let seq = 0;
  return {
    _users: users,
    _admins: admins,
    _resetTokens: resetTokens,
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
        users.find((u) =>
          where.contact ? u.contact === where.contact : where.googleId ? u.googleId === where.googleId : u.id === where.id,
        ) ?? null,
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
    passwordResetToken: {
      create: async ({ data }: any) => {
        const t = { id: `prt_${++seq}`, usedAt: null, ...data };
        resetTokens.push(t);
        return t;
      },
      findUnique: async ({ where }: any) => resetTokens.find((t) => t.tokenHash === where.tokenHash) ?? null,
      update: async ({ where, data }: any) => {
        const t = resetTokens.find((r) => r.id === where.id);
        Object.assign(t, data);
        return t;
      },
      updateMany: async ({ where, data }: any) => {
        const matches = resetTokens.filter(
          (t) =>
            t.role === where.role &&
            t.targetId === where.targetId &&
            t.usedAt === where.usedAt &&
            t.id !== where.id.not,
        );
        for (const t of matches) Object.assign(t, data);
        return { count: matches.length };
      },
    },
  };
}

function makeFakeEmail() {
  return { sendPasswordReset: jest.fn().mockResolvedValue(undefined) };
}

function makeFakeAudit() {
  return { record: jest.fn().mockResolvedValue(undefined) };
}

/** Fake GoogleAuthService — verifyIdToken defaults to a stable "verified" profile. */
function makeFakeGoogleAuth(profile?: Partial<{ sub: string; email: string; emailVerified: boolean; name: string }>) {
  return {
    verifyIdToken: jest.fn().mockResolvedValue({
      sub: 'google-sub-1',
      email: 'asha@example.com',
      emailVerified: true,
      name: 'Asha',
      ...profile,
    }),
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
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

    const res = await auth.adminLogin({ email: 'admin@example.com', password: 'admin-secret' });

    expect(res.admin).toEqual({ id: 'admin_1', name: 'Admin' });
    expect(res.token).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    const payload: any = jwt.verify(res.token, { secret: process.env.JWT_ADMIN_SECRET });
    expect(payload).toMatchObject({ sub: 'admin_1', role: 'admin', typ: 'access', email: 'admin@example.com' });
  });

  it('rejects admin login with invalid credentials', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

    await expect(
      auth.adminLogin({ email: 'admin@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('hashes the password on registration (never stores plaintext)', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
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
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
    await auth.userRegister(REGISTER);
    await expect(
      auth.userLogin({ contact: REGISTER.contact, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts login with the correct password and returns tokens', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
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
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
    await auth.userRegister(REGISTER);
    await expect(auth.userRegister(REGISTER)).rejects.toBeInstanceOf(ConflictException);
  });

  it('exchanges a valid refresh token for a new access token', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
    const { refreshToken } = await auth.userRegister(REGISTER);
    const refreshed = await auth.refresh('user', refreshToken);
    expect(refreshed.token).toBeTruthy();
    const payload: any = jwt.verify(refreshed.token, { secret: process.env.JWT_USER_SECRET });
    expect(payload.typ).toBe('access');
  });

  it('rejects an access token used as a refresh token', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
    const { token } = await auth.userRegister(REGISTER);
    await expect(auth.refresh('user', token)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('creates a new user on first Google sign-in, with a blank/incomplete profile', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

    const res = await auth.userGoogleAuth('fake-id-token', 'hi');

    expect(googleAuth.verifyIdToken).toHaveBeenCalledWith('fake-id-token');
    expect(res.token).toBeTruthy();
    expect(res.profileComplete).toBe(false);
    const stored = prisma._users[0];
    expect(stored.contact).toBe('asha@example.com');
    expect(stored.googleId).toBe('google-sub-1');
    expect(stored.passwordHash).toBeNull();
    expect(stored.consent).toBe(false);
    expect(stored.dob).toBe('');
    expect(stored.lang).toBe('hi');
  });

  it('reuses the same user on a second Google sign-in for the same account', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

    const first = await auth.userGoogleAuth('token-1');
    const second = await auth.userGoogleAuth('token-2');

    expect(second.user.id).toBe(first.user.id);
    expect(prisma._users).toHaveLength(1);
  });

  it('links Google sign-in to an existing password account with the same email', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

    const registered = await auth.userRegister(REGISTER);
    const res = await auth.userGoogleAuth('fake-id-token');

    expect(res.user.id).toBe(registered.user.id);
    expect(prisma._users).toHaveLength(1);
    expect(prisma._users[0].googleId).toBe('google-sub-1');
    // A complete, registered profile stays complete after linking Google.
    expect(res.profileComplete).toBe(true);
  });

  it('rejects a Google account with an unverified email', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth({ emailVerified: false });
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

    await expect(auth.userGoogleAuth('fake-id-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma._users).toHaveLength(0);
  });

  it('changes a user password after verifying the current password', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
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
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

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
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

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

  it('records an audit entry on admin login and on admin-as-user impersonation', async () => {
    const prisma = makeFakePrisma();
    const email = makeFakeEmail();
    const audit = makeFakeAudit();
    prisma._admins.push({
      id: 'admin_1',
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('admin-secret', 10),
    });
    const googleAuth = makeFakeGoogleAuth();
    const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

    await auth.adminLogin({ email: 'admin@example.com', password: 'admin-secret' });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ adminId: 'admin_1', action: 'admin_login' }),
    );

    const session = await auth.adminUserSession('admin_1');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ adminId: 'admin_1', action: 'admin_impersonate_user', targetType: 'user' }),
    );
    // The issued token carries isAdminSession so the user app can show an impersonation banner.
    const payload: any = jwt.verify(session.token, { secret: process.env.JWT_USER_SECRET });
    expect(payload.isAdminSession).toBe(true);
  });

  describe('forgot / reset password', () => {
    it('userForgotPassword() always returns { sent: true }, emailing a reset link only when the contact exists', async () => {
      const prisma = makeFakePrisma();
      const email = makeFakeEmail();
      const audit = makeFakeAudit();
      const googleAuth = makeFakeGoogleAuth();
      const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
      await auth.userRegister(REGISTER);

      await expect(auth.userForgotPassword(REGISTER.contact)).resolves.toEqual({ sent: true });
      expect(email.sendPasswordReset).toHaveBeenCalledTimes(1);
      expect(email.sendPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({ to: REGISTER.contact, role: 'user' }),
      );

      await expect(auth.userForgotPassword('nobody@example.com')).resolves.toEqual({ sent: true });
      // No second email — the unknown contact is silently ignored (no enumeration).
      expect(email.sendPasswordReset).toHaveBeenCalledTimes(1);
    });

    it('userResetPassword() consumes a token, updates the password, and rejects reuse', async () => {
      const prisma = makeFakePrisma();
      const email = makeFakeEmail();
      const audit = makeFakeAudit();
      const googleAuth = makeFakeGoogleAuth();
      const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
      await auth.userRegister(REGISTER);

      await auth.userForgotPassword(REGISTER.contact);
      const resetUrl: string = email.sendPasswordReset.mock.calls[0][0].resetUrl;
      const token = new URL(resetUrl).searchParams.get('token')!;
      expect(token).toBeTruthy();

      await expect(
        auth.userResetPassword({ token, newPassword: 'brand-new-secret', confirmPassword: 'brand-new-secret' }),
      ).resolves.toEqual({ changed: true });

      await expect(
        auth.userLogin({ contact: REGISTER.contact, password: REGISTER.password }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        auth.userLogin({ contact: REGISTER.contact, password: 'brand-new-secret' }),
      ).resolves.toHaveProperty('token');

      // The same token cannot be used twice.
      await expect(
        auth.userResetPassword({ token, newPassword: 'another-secret', confirmPassword: 'another-secret' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('userResetPassword() rejects an invalid/unknown token', async () => {
      const prisma = makeFakePrisma();
      const email = makeFakeEmail();
      const audit = makeFakeAudit();
      const googleAuth = makeFakeGoogleAuth();
      const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);

      await expect(
        auth.userResetPassword({ token: 'not-a-real-token', newPassword: 'whatever1', confirmPassword: 'whatever1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('a reset token cannot be used across roles (admin token rejected by userResetPassword)', async () => {
      const prisma = makeFakePrisma();
      const email = makeFakeEmail();
      const audit = makeFakeAudit();
      const googleAuth = makeFakeGoogleAuth();
      const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
      prisma._admins.push({
        id: 'admin_1',
        email: 'admin@example.com',
        name: 'Admin',
        passwordHash: await bcrypt.hash('admin-secret', 10),
      });

      await auth.adminForgotPassword('admin@example.com');
      const resetUrl: string = email.sendPasswordReset.mock.calls[0][0].resetUrl;
      const token = new URL(resetUrl).searchParams.get('token')!;

      await expect(
        auth.userResetPassword({ token, newPassword: 'whatever1', confirmPassword: 'whatever1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('adminResetPassword() updates the admin password and records an audit entry', async () => {
      const prisma = makeFakePrisma();
      const email = makeFakeEmail();
      const audit = makeFakeAudit();
      const googleAuth = makeFakeGoogleAuth();
      const auth = new AuthService(prisma as never, jwt, email as never, audit as never, googleAuth as never);
      prisma._admins.push({
        id: 'admin_1',
        email: 'admin@example.com',
        name: 'Admin',
        passwordHash: await bcrypt.hash('admin-secret', 10),
      });

      await auth.adminForgotPassword('admin@example.com');
      const resetUrl: string = email.sendPasswordReset.mock.calls[0][0].resetUrl;
      const token = new URL(resetUrl).searchParams.get('token')!;

      await expect(
        auth.adminResetPassword({ token, newPassword: 'brand-new-admin-secret', confirmPassword: 'brand-new-admin-secret' }),
      ).resolves.toEqual({ changed: true });
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({ adminId: 'admin_1', action: 'admin_password_reset' }),
      );
      await expect(
        auth.adminLogin({ email: 'admin@example.com', password: 'brand-new-admin-secret' }),
      ).resolves.toHaveProperty('token');
    });
  });
});
