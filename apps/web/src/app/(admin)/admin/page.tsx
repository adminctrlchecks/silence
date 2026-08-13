import Link from 'next/link';

/**
 * Admin dashboard home. Placeholder — TailAdmin's dashboard components get
 * adapted here, each section wired to its /admin/* API endpoint.
 */
export default function AdminHome() {
  const sections = [
    ['Questions', 'Common / Level 1 / Level 2, per category', '/admin/questions'],
    ['Answers', 'Admin + AI Mode, review AI-generated', '/admin/answers'],
    ['Remedies', 'Per category, linked to questions', '/admin/remedies'],
    ['Chart config', 'Astrology chart style per category', '/admin/chart-config'],
    ['Import', 'Bulk .xlsx import', '/admin/import'],
    ['Languages', 'Manage languages + auto-translate', '/admin/languages'],
  ];
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1>Silence — Admin</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
        }}
      >
        {sections.map(([title, desc, href]) => (
          <Link
            key={href}
            href={href}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', textDecoration: 'none' }}
          >
            <strong>{title}</strong>
            <p style={{ color: '#666', fontSize: '.9rem' }}>{desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
