import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ResetPasswordCard } from '@/components/auth/reset-password-card';

export default async function ResetPasswordPage() {
  const t = await getTranslations('ResetPassword');
  const copy = {
    eyebrow: t('eyebrow'),
    title: t('title'),
    description: t('description'),
    newPassword: t('newPassword'),
    confirmPassword: t('confirmPassword'),
    submit: t('submit'),
    submitting: t('submitting'),
    success: t('success'),
    invalidLink: t('invalidLink'),
  };

  return (
    <Suspense>
      <ResetPasswordCard endpoint="/api/auth/reset-password" redirectTo="/login" copy={copy} />
    </Suspense>
  );
}
