import Link from 'next/link';
import { ShieldCheck, UserCog } from 'lucide-react';
import { ChangePasswordCard } from '@/components/auth/change-password-card';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
            <UserCog className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">Account</p>
            <h1 className="mt-1 text-xl font-semibold tracking-normal">Admin settings</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Signed in with admin access. Password and security controls for this account live here, separate
              from the content dashboard.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/audit-log">
            <ShieldCheck />
            View audit log
          </Link>
        </Button>
      </section>

      <ChangePasswordCard
        endpoint="/api/auth/admin/change-password"
        redirectTo="/admin/login"
        copy={{
          eyebrow: 'Security',
          title: 'Change admin password',
          description: 'Confirm your current password, then choose a new one. You will be signed out after it changes.',
          currentPassword: 'Current password',
          newPassword: 'New password',
          confirmPassword: 'Confirm new password',
          submit: 'Change password',
          submitting: 'Changing password',
          success: 'Password changed. Please sign in again.',
        }}
      />
    </div>
  );
}
