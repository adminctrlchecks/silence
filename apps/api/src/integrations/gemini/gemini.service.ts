import { Injectable, Logger } from '@nestjs/common';
import type { GenerativeModel } from '@google/generative-ai';
import type { Category, Level } from '@silence/shared';

/**
 * Thin wrapper around the Gemini API. Two jobs (docs/API.md §12):
 *   1. AI-Mode fallback answers when the admin hasn't written one.
 *   2. Translation of content across the enabled languages.
 *
 * When `GEMINI_API_KEY` is set it calls the real `@google/generative-ai` model;
 * otherwise it returns deterministic placeholder text so the rest of the app
 * (and local dev / CI) works without a key. The provider is hidden behind this
 * service, so it can be swapped without touching controllers.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private model?: GenerativeModel;
  private modelInitFailed = false;

  /** Whether a real key is configured. */
  get enabled(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  /** Which backend a call will use — handy for API responses / logging. */
  get provider(): 'gemini' | 'stub' {
    return this.enabled ? 'gemini' : 'stub';
  }

  async generateAnswer(params: {
    questionText: string;
    level: Level;
    category: Category;
    lang: string;
  }): Promise<string> {
    const prompt =
      `You are Silence, a warm astrology Q&A assistant. Write one reviewed-style admin answer ` +
      `for a ${params.level} question in the "${params.category}" category, using the language ` +
      `with code "${params.lang}".\n\n` +
      `Question:\n${params.questionText}\n\n` +
      `Requirements:\n` +
      `- 2 to 4 sentences, specific enough to feel useful but not overconfident.\n` +
      `- Use gentle astrology language as reflective guidance, not certainty.\n` +
      `- Do not give medical, financial, or legal advice.\n` +
      `- Do not promise outcomes or make absolute predictions.\n` +
      `Return only the answer text, with no heading or commentary.`;
    return this.callGemini(prompt);
  }

  async translate(text: string, target: string): Promise<string> {
    if (!text?.trim()) return text;
    return this.callGemini(
      `Translate the text between <t></t> into the language with code "${target}". ` +
        `Preserve meaning and tone. Return only the translation, with no quotes or commentary.\n\n` +
        `<t>${text}</t>`,
    );
  }

  /**
   * Produce a personalised astrology reading from the computed chart geometry
   * and the user's Level 2 answers, in the requested language.
   */
  async interpretChart(params: {
    category: Category;
    ascendant?: { signName: string; degree: number } | null;
    placements: Array<{
      planet: string;
      signName: string;
      house: number;
      degree?: number;
      retrograde: boolean;
    }>;
    answers: string[];
    lang: string;
  }): Promise<string> {
    const asc = params.ascendant
      ? `Ascendant in ${params.ascendant.signName} (${params.ascendant.degree.toFixed(1)}°).`
      : 'Ascendant not available.';
    const placements =
      params.placements
        .map((p) => {
          const degree = typeof p.degree === 'number' ? ` ${p.degree.toFixed(1)}°` : '';
          return `${p.planet}: ${p.signName}${degree}, house ${p.house}${
            p.retrograde ? ', retrograde' : ''
          }`;
        })
        .join('\n') || 'No planetary placements available.';
    const answers =
      params.answers
        .map((a) => a?.trim())
        .filter(Boolean)
        .map((a, index) => `${index + 1}. ${a}`)
        .join('\n') || 'No Level 2 reflections were provided.';

    const prompt =
      `You are Silence, a grounded astrologer writing for the "${params.category}" category. ` +
      `Interpret the computed birth chart and the user's own Level 2 reflections. Write in the ` +
      `language with code "${params.lang}".\n\n` +
      `Birth chart geometry:\n` +
      `- ${asc}\n` +
      `${placements}\n\n` +
      `User Level 2 reflections:\n${answers}\n\n` +
      `Write 2 to 3 short paragraphs. Paragraph 1 should describe the core chart tone from the ` +
      `ascendant and strongest placement themes. Paragraph 2 should connect the chart to the user's ` +
      `reflections. Paragraph 3, if useful, should offer one gentle practice or focus.\n\n` +
      `Boundaries: no absolute predictions, no fear-based language, no medical/financial/legal advice, ` +
      `and no claims that astrology guarantees an outcome. Return only the reading text.`;
    return this.callGemini(prompt);
  }

  /** Lazily build (and cache) the generative model. Returns undefined if unavailable. */
  private getModel(): GenerativeModel | undefined {
    if (this.model || this.modelInitFailed) return this.model;
    try {
      // Lazy require so the SDK is only loaded when a key is present.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GoogleGenerativeAI } = require('@google/generative-ai') as typeof import('@google/generative-ai');
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      this.model = client.getGenerativeModel({
        model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      });
      return this.model;
    } catch (err) {
      this.modelInitFailed = true;
      this.logger.error(`Failed to initialise Gemini client: ${String(err)}`);
      return undefined;
    }
  }

  private stub(prompt: string): string {
    return `[AI placeholder] ${prompt.slice(0, 80)}…`;
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.enabled) {
      this.logger.warn('GEMINI_API_KEY not set — returning placeholder text.');
      return this.stub(prompt);
    }
    const model = this.getModel();
    if (!model) return this.stub(prompt);
    try {
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      return text || this.stub(prompt);
    } catch (err) {
      // Never let an upstream outage break the request — fall back to the stub.
      this.logger.error(`Gemini call failed, using placeholder: ${String(err)}`);
      return this.stub(prompt);
    }
  }
}
