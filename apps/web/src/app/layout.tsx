import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { dirFor, normalizeLanguage } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Silence',
  description: 'Multilingual astrology Q&A.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const lang = normalizeLanguage(cookieStore.get('silence_lang')?.value);

  return (
    <html lang={lang} dir={dirFor(lang)} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
