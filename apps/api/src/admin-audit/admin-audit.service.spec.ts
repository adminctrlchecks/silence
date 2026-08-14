import { AdminAuditService } from './admin-audit.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('AdminAuditService', () => {
  let prisma: PrismaMock;
  let service: AdminAuditService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new AdminAuditService(prisma as never);
  });

  it('record() writes an entry', async () => {
    prisma.adminAuditLog.create.mockResolvedValue({});
    await service.record({ adminId: 'a1', adminEmail: 'admin@example.com', action: 'admin_login' });
    expect(prisma.adminAuditLog.create).toHaveBeenCalledWith({
      data: { adminId: 'a1', adminEmail: 'admin@example.com', action: 'admin_login' },
    });
  });

  it('record() swallows write failures instead of throwing', async () => {
    prisma.adminAuditLog.create.mockRejectedValue(new Error('db down'));
    await expect(
      service.record({ adminId: 'a1', adminEmail: 'a@example.com', action: 'admin_login' }),
    ).resolves.toBeUndefined();
  });

  it('list() paginates and maps rows, applying adminId/action filters', async () => {
    prisma.adminAuditLog.findMany.mockResolvedValue([
      {
        id: 'log1',
        adminId: 'a1',
        adminEmail: 'admin@example.com',
        action: 'admin_impersonate_user',
        targetType: 'user',
        targetId: 'u1',
        detail: null,
        createdAt: new Date('2026-08-14T00:00:00.000Z'),
      },
    ]);
    prisma.adminAuditLog.count.mockResolvedValue(1);

    const res = await service.list({ adminId: 'a1', action: 'admin_impersonate_user', page: 1, limit: 20 });

    expect(res.data[0]).toEqual({
      id: 'log1',
      adminId: 'a1',
      adminEmail: 'admin@example.com',
      action: 'admin_impersonate_user',
      targetType: 'user',
      targetId: 'u1',
      detail: undefined,
      createdAt: '2026-08-14T00:00:00.000Z',
    });
    expect(res.total).toBe(1);
  });
});
