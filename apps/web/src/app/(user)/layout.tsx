/**
 * User-site layout (the astrology-themed public experience).
 * The astrology template's shell/nav/footer get adapted into here.
 */
export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <div className="user-shell">{children}</div>;
}
