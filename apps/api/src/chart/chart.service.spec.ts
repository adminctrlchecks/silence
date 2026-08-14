import { NotFoundException } from '@nestjs/common';
import { ChartService } from './chart.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('ChartService', () => {
  let prisma: PrismaMock;
  let astrology: { compute: jest.Mock };
  let gemini: { interpretChart: jest.Mock };
  let service: ChartService;

  beforeEach(() => {
    prisma = createPrismaMock();
    astrology = {
      compute: jest.fn().mockReturnValue({
        engine: 'test',
        ascendant: { signName: 'Cancer', degree: 12.4 },
        placements: [{ planet: 'Moon', signName: 'Pisces', house: 9, degree: 18.2, retrograde: false }],
      }),
    };
    gemini = { interpretChart: jest.fn().mockResolvedValue('interpretation text') };
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
    expect(gemini.interpretChart).toHaveBeenCalledWith({
      category: 'female',
      ascendant: { signName: 'Cancer', degree: 12.4 },
      placements: [{ planet: 'Moon', signName: 'Pisces', house: 9, degree: 18.2, retrograde: false }],
      answers: ['answer A', 'answer B'],
      lang: 'en',
    });
    expect(prisma.userChart.create).toHaveBeenCalled();
    expect(prisma.userChart.create.mock.calls[0][0].data).toMatchObject({ userId: 'u1', sessionId: undefined });
    expect(res).toMatchObject({ userId: 'u1', category: 'female', type: 'astrology', interpretation: 'interpretation text' });
  });

  it('generateForUser() with a sessionId returns the existing chart instead of recomputing', async () => {
    prisma.userChart.findFirst.mockResolvedValue({
      userId: 'u1',
      category: 'female',
      style: 'south_indian',
      data: { engine: 'stored' },
      interpretation: 'stored interpretation',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    });

    const res = await service.generateForUser('u1', 'en', 's1');

    expect(prisma.userChart.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sessionId: 's1' } }),
    );
    expect(astrology.compute).not.toHaveBeenCalled();
    expect(gemini.interpretChart).not.toHaveBeenCalled();
    expect(prisma.userChart.create).not.toHaveBeenCalled();
    expect(res).toMatchObject({ userId: 'u1', style: 'south-indian', interpretation: 'stored interpretation' });
  });

  it('generateForUser() with a sessionId but no existing chart generates and links it', async () => {
    prisma.userChart.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1', category: 'female', dob: '1998-04-21', timeOfBirth: '07:35',
      placeCity: 'Chennai', placeCountry: 'IN', placeLat: 13.08, placeLng: 80.27,
    });
    prisma.chartConfig.findUnique.mockResolvedValue(null);
    prisma.userResponse.findMany.mockResolvedValue([]);
    prisma.userChart.create.mockImplementation((args: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: 'c1', createdAt: new Date(), ...args.data }),
    );

    await service.generateForUser('u1', 'en', 's1');

    expect(prisma.userChart.create.mock.calls[0][0].data).toMatchObject({ userId: 'u1', sessionId: 's1' });
  });
});
