import type { Level } from '@silence/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { QuestionFlow } from '@/components/questions/question-flow';
import { publicApi } from '@/lib/api';
import { USER_TOKEN_COOKIE } from '@/lib/auth-routing';
import { normalizeSessionLanguage } from '@/lib/session-preferences';

const levels: Level[] = ['common', 'level1', 'level2'];

function decodeUserId(token: string) {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: string };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export default async function QuestionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_TOKEN_COOKIE)?.value;
  const userId = token ? decodeUserId(token) : null;

  if (!token || !userId) {
    redirect('/login');
  }

  const profile = await publicApi.profile(userId, token);
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
