import { GeminiService } from './gemini.service';

describe('GeminiService prompts', () => {
  let service: GeminiService;
  let callGemini: jest.SpyInstance<Promise<string>, [string]>;

  beforeEach(() => {
    service = new GeminiService();
    callGemini = jest
      .spyOn(service as unknown as { callGemini: (prompt: string) => Promise<string> }, 'callGemini')
      .mockResolvedValue('generated text');
  });

  it('generateAnswer() asks for bounded astrology guidance', async () => {
    await service.generateAnswer({
      questionText: 'What pattern keeps returning?',
      level: 'level1',
      category: 'female',
      lang: 'en',
    });

    const prompt = callGemini.mock.calls[0][0];
    expect(prompt).toContain('What pattern keeps returning?');
    expect(prompt).toContain('2 to 4 sentences');
    expect(prompt).toContain('Do not give medical, financial, or legal advice');
    expect(prompt).toContain('Do not promise outcomes');
  });

  it('interpretChart() includes chart placements and Level 2 reflections', async () => {
    await service.interpretChart({
      category: 'other',
      ascendant: { signName: 'Libra', degree: 7.25 },
      placements: [
        { planet: 'Sun', signName: 'Leo', house: 11, degree: 2.5, retrograde: false },
        { planet: 'Saturn', signName: 'Pisces', house: 6, degree: 19.1, retrograde: true },
      ],
      answers: ['I am ready to protect my time.', 'I want more spacious work.'],
      lang: 'es',
    });

    const prompt = callGemini.mock.calls[0][0];
    expect(prompt).toContain('Ascendant in Libra');
    expect(prompt).toContain('Sun: Leo 2.5°');
    expect(prompt).toContain('Saturn: Pisces 19.1°, house 6, retrograde');
    expect(prompt).toContain('1. I am ready to protect my time.');
    expect(prompt).toContain('language with code "es"');
    expect(prompt).toContain('no absolute predictions');
  });
});
