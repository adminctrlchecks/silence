import Link from 'next/link';
import {
  BarChart3,
  Bot,
  ClipboardList,
  FileSpreadsheet,
  Languages,
  MessageSquareText,
  MoonStar,
} from 'lucide-react';
import { ChangePasswordCard } from '@/components/auth/change-password-card';

const metrics = [
  { value: '11', label: 'Languages', detail: 'Arabic RTL ready' },
  { value: '3', label: 'Categories', detail: 'Male, female, other' },
  { value: '2', label: 'Answer levels', detail: 'Level 1 and Level 2' },
  { value: '3010', label: 'API port', detail: 'NestJS source of truth' },
];

const modules = [
  { label: 'Questions', href: '/admin/questions', icon: ClipboardList, detail: 'Common, Level 1, Level 2' },
  { label: 'Answers', href: '/admin/answers', icon: MessageSquareText, detail: 'Admin content and review state' },
  { label: 'AI review', href: '/admin/answers?source=ai&reviewed=false', icon: Bot, detail: 'Generated answers awaiting approval' },
  { label: 'Remedies', href: '/admin/remedies', icon: MoonStar, detail: 'Category guidance linked to content' },
  { label: 'Chart config', href: '/admin/chart-config', icon: BarChart3, detail: 'Astrology style and required fields' },
  { label: 'Import', href: '/admin/import', icon: FileSpreadsheet, detail: 'Spreadsheet templates and job status' },
  { label: 'Languages', href: '/admin/languages', icon: Languages, detail: 'Enabled locales and auto-translate' },
];

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ value, label, detail }) => (
          <div key={label} className="rounded-md border border-border bg-card p-4 shadow-sm">
            <p className="text-2xl font-semibold tracking-normal">{value}</p>
            <p className="mt-1 text-sm font-medium">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold tracking-normal">Content modules</h2>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
          {modules.map(({ label, href, icon: Icon, detail }) => (
            <Link key={href} href={href} className="bg-card p-4 transition-colors hover:bg-muted">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{label}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
