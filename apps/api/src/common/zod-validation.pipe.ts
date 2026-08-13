import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

/**
 * Validates a request body against a shared Zod schema (@silence/shared),
 * keeping the API and web app on the exact same contract.
 *
 * Usage: @Body(new ZodValidationPipe(createQuestionSchema)) body: CreateQuestionInput
 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues
          .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
          .join('; '),
      );
    }
    return result.data;
  }
}
