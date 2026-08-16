import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordCard } from '@/components/auth/forgot-password-card';

export const metadata: Metadata = {
  title: 'Reset Access',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ForgotPasswordPage() {
  const t = await getTranslations('ForgotPassword');

  return (
    <ForgotPasswordCard
      endpoint="/api/auth/forgot-password"
      fieldName="contact"
      loginHref="/login"
      copy={{
        eyebrow: t('eyebrow'),
        title: t('title'),
        description: t('description'),
        fieldLabel: t('fieldLabel'),
        fieldPlaceholder: t('fieldPlaceholder'),
        submit: t('submit'),
        submitting: t('submitting'),
        success: t('success'),
        backToLogin: t('backToLogin'),
      }}
    />
  );
}
