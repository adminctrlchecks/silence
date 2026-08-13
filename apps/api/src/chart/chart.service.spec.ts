import { NotFoundException } from '@nestjs/common';
import { ChartService } from './chart.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('ChartService', () => {
  let prisma: PrismaMock;
  let astrology: { compute: jest.Mock };
  let gemini: { translate: jest.Mock };
  let service: ChartService;

  beforeEach(() => {
    prisma = createPrismaMock();
    astrology = { compute: jest.fn().mockReturnValue({ engine: 'test', placements: [] }) };
    gemini = { translate: jest.fn().mockResolvedValue('interpretation text') };
    service = new ChartService(prisma as never, astrology as never, gemini as never);
  });

  it('getConfig() returns a default config when none is stored', async () => {
    prisma.chartConfig.findUnique.mockResolvedValue(null);
    const cfg = await service.getConfig('female');
    expect(cfg).toMatchObject({ category: 'female', type: 'astrology', style: 'north-indian', source: 'level2' });
  });

  it('getConfig() converts the stored DB style to hyphenated form', async () => {
    prisma.chartConfig.findUnique.mockResolvedValue({ category: 'male', type: 'astrology', style: 'south_indian', source: 'level2', requires: [] });
    const cfg = await service.getConfig('male');
    expect(cfg.style).toBe('south-indian');
  });

  it('generateForUser() throws NotFound for an unknown user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.generateForUser('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('generateForUser() computes geometry, writes interpretation, and persists the chart', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1', category: 'female', dob: '1998-04-21', timeOfBirth: '07:35',
      placeCity: 'Chennai', placeCountry: 'IN', placeLat: 13.08, placeLng: 80.27,
    });
    prisma.chartConfig.findUnique.mockResolvedValue(null);
    prisma.userResponse.findMany.mockResolvedValue([{ value: 'answer A' }, { value: 'answer B' }]);
    prisma.userChart.create.mockImplementation((args: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'c1', createdAt: new Date(), ...args.data }),
    );

    const res = await service.generateForUser('u1', 'en');

    expect(astrology.compute).toHaveBeenCalled();
    expect(gemini.translate).toHaveBeenCalled();
    expect(prisma.userChart.create).toHaveBeenCalled();
    expect(res).toMatchObject({ userId: 'u1', category: 'female', type: 'astrology', interpretation: 'interpretation text' });
  });
});
