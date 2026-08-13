import Link from 'next/link';

const sections = [
  ['Questions', 'Common / Level 1 / Level 2, per category', '/admin/questions'],
  ['Answers', 'Admin + AI Mode, review AI-generated', '/admin/answers'],
  ['Remedies', 'Per category, linked to questions', '/admin/remedies'],
  ['Chart config', 'Astrology chart style per category', '/admin/chart-config'],
  ['Import', 'Bulk .xlsx import', '/admin/import'],
  ['Languages', 'Manage languages + auto-translate', '/admin/languages'],
];

export default function AdminHome() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">Content operations</p>
        <h1 className="text-3xl font-semibold tracking-normal">Silence Admin</h1>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(([title, description, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-md border border-border bg-card p-4 text-card-foreground transition-colors hover:border-primary/60 hover:bg-muted"
          >
            <strong className="text-sm font-semibold">{title}</strong>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
