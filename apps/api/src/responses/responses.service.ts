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

    const created = await this.prisma.$transaction(
      input.answers.map((a) =>
        this.prisma.userResponse.create({
          data: {
            userId: input.userId,
            sessionId: input.sessionId,
            questionId: a.questionId,
            level: input.level,
            category: input.category,
            value: a.value,
          },
        }),
      ),
    );

    if (input.sessionId) await this.sessions.markResponsesSaved(input.sessionId);
    return { saved: created.length };
  }
}
