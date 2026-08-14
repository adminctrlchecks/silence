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

    // Default mocks
    prisma.answer.findMany.mockResolvedValue([]);
    prisma.userResponse.findMany.mockResolvedValue([]);
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', lang: 'en', category: 'female' });
    prisma.readingSession.findUnique.mockResolvedValue({ id: 's1', lang: 'en', category: 'female' });
  });

  it('submit() persists one row per answer and reports the count', async () => {
    prisma.userResponse.create.mockImplementation((args: { data: unknown }) => Promise.resolve(args.data));
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

  it('submit() updates existing responses instead of creating duplicates', async () => {
    // Mock existing responses for q1
    prisma.userResponse.findMany.mockResolvedValue([
      { id: 'r1', questionId: 'q1', userId: 'u1', value: 'old value' },
    ]);
    prisma.userResponse.update.mockImplementation((args: { data: unknown }) => Promise.resolve(args.data));

    const res = await service.submit({
      userId: 'u1',
      level: 'level1',
      category: 'female',
      answers: [
        { questionId: 'q1', value: 'new value' },
        { questionId: 'q2', value: 'yes' },
      ],
    });

    expect(res).toEqual({ saved: 2 });
    // Should update q1, create q2
    expect(prisma.userResponse.update).toHaveBeenCalledTimes(1);
    expect(prisma.userResponse.create).toHaveBeenCalledTimes(1);
    expect(prisma.userResponse.update.mock.calls[0][0]).toMatchObject({
      where: { id: 'r1' },
      data: { value: 'new value' },
    });
  });

  it('submit() snapshots the shown answer ID and text', async () => {
    // Mock approved answer for q1
    prisma.answer.findMany.mockResolvedValue([
      {
        id: 'a1',
        questionId: 'q1',
        text: 'This is the default answer explanation',
        translations: [],
      },
    ]);
    prisma.userResponse.create.mockImplementation((args: { data: unknown }) => Promise.resolve(args.data));

    const res = await service.submit({
      userId: 'u1',
      level: 'level1',
      category: 'female',
      answers: [{ questionId: 'q1', value: 'my answer' }],
    });

    expect(res).toEqual({ saved: 1 });
    expect(prisma.userResponse.create.mock.calls[0][0].data).toMatchObject({
      questionId: 'q1',
      value: 'my answer',
      answerId: 'a1',
      answerTextShown: 'This is the default answer explanation',
    });
  });

  it('submit() with a sessionId checks ownership first and marks the session in progress', async () => {
    prisma.userResponse.create.mockImplementation((args: { data: unknown }) => Promise.resolve(args.data));
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
