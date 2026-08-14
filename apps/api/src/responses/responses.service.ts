import { Injectable } from '@nestjs/common';
import type { SubmitResponsesInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class ResponsesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
  ) {}

  async submit(input: SubmitResponsesInput) {
    if (input.sessionId) await this.sessions.findOwned(input.userId, input.sessionId); // 403/404 before writing

    // 1. Resolve category and language
    let lang = 'en';
    let category = input.category;

    if (input.sessionId) {
      const session = await this.prisma.readingSession.findUnique({
        where: { id: input.sessionId },
      });
      if (session) {
        lang = session.lang;
        category = session.category;
      }
    } else {
      const user = await this.prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (user) {
        lang = user.lang;
        category = user.category;
      }
    }

    // 2. Fetch all approved answers in parallel
    const questionIds = input.answers.map((a) => a.questionId);
    const approvedAnswers = await this.prisma.answer.findMany({
      where: {
        questionId: { in: questionIds },
        level: input.level,
        category,
        reviewed: true,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        translations: {
          where: { lang },
        },
      },
    });

    // Match them up by questionId
    const answersMap = new Map<string, { id: string; text: string }>();
    for (const ans of approvedAnswers) {
      if (!answersMap.has(ans.questionId)) {
        const text = ans.translations[0]?.text ?? ans.text;
        answersMap.set(ans.questionId, { id: ans.id, text });
      }
    }

    // 3. Find existing responses for these questions to decide between create and update
    const existingResponses = await this.prisma.userResponse.findMany({
      where: {
        userId: input.userId,
        sessionId: input.sessionId,
        questionId: { in: questionIds },
      },
    });
    const existingMap = new Map<string, string>(); // questionId -> responseId
    for (const r of existingResponses) {
      existingMap.set(r.questionId, r.id);
    }

    // 4. Build write operations
    const operations = input.answers.map((a) => {
      const snap = answersMap.get(a.questionId);
      const answerId = snap?.id ?? null;
      const answerTextShown = snap?.text ?? null;
      const existingId = existingMap.get(a.questionId);

      if (existingId) {
        return this.prisma.userResponse.update({
          where: { id: existingId },
          data: {
            value: a.value,
            answerId,
            answerTextShown,
          },
        });
      } else {
        return this.prisma.userResponse.create({
          data: {
            userId: input.userId,
            sessionId: input.sessionId,
            questionId: a.questionId,
            level: input.level,
            category,
            value: a.value,
            answerId,
            answerTextShown,
          },
        });
      }
    });

    // 5. Run writes in a transaction
    const results = await this.prisma.$transaction(operations);

    if (input.sessionId) await this.sessions.markResponsesSaved(input.sessionId);
    return { saved: results.length };
  }
}
