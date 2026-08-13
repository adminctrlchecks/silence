import { ResponsesService } from './responses.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('ResponsesService', () => {
  let prisma: PrismaMock;
  let service: ResponsesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ResponsesService(prisma as never);
  });

  it('submit() persists one row per answer and reports the count', async () => {
    prisma.userResponse.create.mockImplementation((args: unknown) => Promise.resolve(args));
    const res = await service.submit({
      userId: 'u1',
      level: 'level1',
      category: 'female',
      answers: [
        { questionId: 'q1', value: '6 hours' },
        { questionId: 'q2', value: 'yes' },
      ],
    });
    expect(res).toEqual({ saved: 2 });
    expect(prisma.userResponse.create).toHaveBeenCalledTimes(2);
    expect(prisma.userResponse.create.mock.calls[0][0].data).toMatchObject({
      userId: 'u1',
      questionId: 'q1',
      level: 'level1',
      category: 'female',
      value: '6 hours',
    });
  });
});
