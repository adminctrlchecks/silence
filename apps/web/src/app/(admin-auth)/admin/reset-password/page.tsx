import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordCard } from '@/components/auth/reset-password-card';

export const metadata: Metadata = {
  title: 'Reset Admin Password',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordCard
        endpoint="/api/auth/admin/reset-password"
        redirectTo="/admin/login"
        forgotPasswordHref="/admin/forgot-password"
        copy={{
          eyebrow: 'Admin account recovery',
          title: 'Choose a new password',
          description: 'Enter a new password for your admin account.',
          newPassword: 'New password',
          confirmPassword: 'Confirm new password',
          submit: 'Reset password',
          submitting: 'Resetting',
          success: 'Password updated. Redirecting to sign in…',
          invalidLink: 'This reset link is invalid or has expired. Request a new one from the sign-in page.',
          requestNewLink: 'Request a new reset link',
        }}
      />
    </Suspense>
  );
}
