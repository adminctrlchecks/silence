import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

const DB_USER = {
  id: 'u1', name: 'Asha', category: 'female', dob: '1998-04-21', timeOfBirth: '07:35',
  placeCity: 'Chennai', placeCountry: 'IN', placeLat: 13.08, placeLng: 80.27,
  contact: 'asha@example.com', lang: 'en', consent: true,
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
});
