import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

const DB_USER = {
  id: 'u1', name: 'Asha', category: 'female', dob: '1998-04-21', timeOfBirth: '07:35',
  placeCity: 'Chennai', placeCountry: 'IN', placeLat: 13.08, placeLng: 80.27,
  contact: 'asha@example.com', lang: 'en', consent: true,
  createdAt: new Date('2026-08-14T00:00:00.000Z'),
  updatedAt: new Date('2026-08-14T01:00:00.000Z'),
};

describe('UsersService', () => {
  let prisma: PrismaMock;
  let service: UsersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new UsersService(prisma as never);
  });

  it('get() maps the flat columns into a placeOfBirth object', async () => {
    prisma.user.findUnique.mockResolvedValue(DB_USER);
    const res = await service.get('u1');
    expect(res.placeOfBirth).toEqual({ city: 'Chennai', country: 'IN', lat: 13.08, lng: 80.27 });
    expect(res).not.toHaveProperty('passwordHash');
  });

  it('get() throws NotFound when the user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.get('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('history() aggregates responses and charts', async () => {
    prisma.user.count.mockResolvedValue(1);
    prisma.userResponse.findMany.mockResolvedValue([{ id: 'resp1' }]);
    prisma.userChart.findMany.mockResolvedValue([{ id: 'chart1' }]);
    prisma.user.findUnique.mockResolvedValue(DB_USER);
    const res = await service.history('u1');
    expect(res).toMatchObject({ userId: 'u1', category: 'female' });
    expect(res.responses).toHaveLength(1);
    expect(res.charts).toHaveLength(1);
  });

  it('update() throws NotFound for an unknown id', async () => {
    prisma.user.count.mockResolvedValue(0);
    await expect(service.update('nope', { name: 'x' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('listForAdmin() returns paginated users with response/chart counts', async () => {
    prisma.user.findMany.mockResolvedValue([{ ...DB_USER, _count: { responses: 2, charts: 1 } }]);
    prisma.user.count.mockResolvedValue(1);

    const res = await service.listForAdmin();

    expect(res).toMatchObject({ page: 1, total: 1 });
    expect(res.data[0]).toMatchObject({
      id: 'u1',
      responseCount: 2,
      chartCount: 1,
      createdAt: '2026-08-14T00:00:00.000Z',
    });
    expect(res.data[0]).not.toHaveProperty('passwordHash');
  });

  it('getForAdmin() includes saved responses and charts', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...DB_USER,
      responses: [{ id: 'r1', createdAt: new Date('2026-08-14T02:00:00.000Z') }],
      charts: [{ id: 'c1', createdAt: new Date('2026-08-14T03:00:00.000Z') }],
    });

    const res = await service.getForAdmin('u1');

    expect(res.responses[0].createdAt).toBe('2026-08-14T02:00:00.000Z');
    expect(res.charts[0].createdAt).toBe('2026-08-14T03:00:00.000Z');
  });
});
