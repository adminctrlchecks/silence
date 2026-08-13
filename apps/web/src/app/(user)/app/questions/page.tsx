import type { Level } from '@silence/shared';
import { redirect } from 'next/navigation';
import { QuestionFlow } from '@/components/questions/question-flow';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

const levels: Level[] = ['common', 'level1', 'level2'];

export default async function QuestionsPage() {
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const lang = normalizeSessionLanguage(profile.lang);
  const questionLists = await Promise.all(
    levels.map((level) => publicApi.questions({ level, category: profile.category, lang })),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <QuestionFlow
        userId={profile.id}
        category={profile.category}
        lang={lang}
        questions={{
          common: questionLists[0].data,
          level1: questionLists[1].data,
          level2: questionLists[2].data,
        }}
      />
    </main>
  );
}
