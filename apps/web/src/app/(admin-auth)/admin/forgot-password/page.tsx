import type { Metadata } from 'next';
import { ForgotPasswordCard } from '@/components/auth/forgot-password-card';

export const metadata: Metadata = {
  title: 'Admin Password Recovery',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminForgotPasswordPage() {
  return (
    <ForgotPasswordCard
      endpoint="/api/auth/admin/forgot-password"
      fieldName="email"
      loginHref="/admin/login"
      copy={{
        eyebrow: 'Admin account recovery',
        title: 'Forgot your password?',
        description: 'Enter your admin email. If it matches an account, we’ll send a reset link.',
        fieldLabel: 'Email',
        fieldPlaceholder: 'admin@example.com',
        submit: 'Send reset link',
        submitting: 'Sending',
        success: 'If that email matches an admin account, a reset link is on its way.',
        backToLogin: 'Back to admin sign in',
      }}
    />
  );
}
