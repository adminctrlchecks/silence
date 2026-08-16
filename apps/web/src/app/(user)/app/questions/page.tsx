import type { Category, Level } from '@silence/shared';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { QuestionFlow } from '@/components/questions/question-flow';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

const levels: Level[] = ['common', 'level1', 'level2'];

export const metadata: Metadata = {
  title: 'Guided Questions',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function QuestionsPage() {
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const lang = normalizeSessionLanguage(profile.lang);
  const [activeSession, ...questionLists] = await Promise.all([
    publicApi.startOrResumeSession(profile.id, session.token),
    ...levels.map((level) => publicApi.questions({ level, category: profile.category, lang })),
  ]);
  const existingResponses = await publicApi.sessionDetail(profile.id, activeSession.id, session.token);

  const initialDisplayAnswers = {} as Record<
    string,
    { id: string; questionId: string; level: Level; category: Category; text: string; source: 'admin' | 'ai'; reviewed: boolean }
  >;
  for (const r of existingResponses.responses) {
    if (r.answerTextShown) {
      initialDisplayAnswers[r.questionId] = {
        id: r.answerId || r.questionId,
        questionId: r.questionId,
        level: r.level,
        category: r.category,
        text: r.answerTextShown,
        source: 'admin',
        reviewed: true,
      };
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <QuestionFlow
        userId={profile.id}
        sessionId={activeSession.id}
        category={profile.category}
        lang={lang}
        questions={{
          common: questionLists[0].data,
          level1: questionLists[1].data,
          level2: questionLists[2].data,
        }}
        savedAnswers={Object.fromEntries(existingResponses.responses.map((r) => [r.questionId, r.value]))}
        initialDisplayAnswers={initialDisplayAnswers}
      />
    </main>
  );
}
