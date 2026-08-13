import { Injectable } from '@nestjs/common';
import type { SubmitResponsesInput } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(input: SubmitResponsesInput) {
    const created = await this.prisma.$transaction(
      input.answers.map((a) =>
        this.prisma.userResponse.create({
          data: {
            userId: input.userId,
            questionId: a.questionId,
            level: input.level,
            category: input.category,
            value: a.value,
          },
        }),
      ),
    );
    return { saved: created.length };
  }
}
