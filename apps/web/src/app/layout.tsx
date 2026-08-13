import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Silence',
  description: 'Multilingual astrology Q&A.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Default document direction is LTR; user-facing pages set `dir` per selected
  // language (Arabic → rtl) once a language is chosen.
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
