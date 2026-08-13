/**
 * Admin panel layout. The TailAdmin dashboard shell (sidebar, header, content
 * frame) gets adapted into here; admin routes live under /admin/*.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}
