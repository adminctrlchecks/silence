import { ResponsesService } from './responses.service';
import { SessionsService } from '../sessions/sessions.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('ResponsesService', () => {
  let prisma: PrismaMock;
  let sessions: { findOwned: jest.Mock; markResponsesSaved: jest.Mock };
  let service: ResponsesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    sessions = { findOwned: jest.fn(), markResponsesSaved: jest.fn() };
    service = new ResponsesService(prisma as never, sessions as unknown as SessionsService);
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
    expect(sessions.findOwned).not.toHaveBeenCalled();
    expect(sessions.markResponsesSaved).not.toHaveBeenCalled();
  });

  it('submit() with a sessionId checks ownership first and marks the session in progress', async () => {
    prisma.userResponse.create.mockImplementation((args: unknown) => Promise.resolve(args));
    const res = await service.submit({
      userId: 'u1',
      sessionId: 's1',
      level: 'common',
      category: 'female',
      answers: [{ questionId: 'q1', value: 'yes' }],
    });
    expect(res).toEqual({ saved: 1 });
    expect(sessions.findOwned).toHaveBeenCalledWith('u1', 's1');
    expect(sessions.markResponsesSaved).toHaveBeenCalledWith('s1');
    expect(prisma.userResponse.create.mock.calls[0][0].data).toMatchObject({ sessionId: 's1' });
  });
});
