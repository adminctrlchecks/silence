import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { dirFor, normalizeLanguage } from '@/lib/i18n';
import { LANGUAGE_COOKIE } from '@/lib/session-preferences';
import './globals.css';

export const metadata: Metadata = {
  title: 'Silence',
  description: 'Multilingual astrology Q&A.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const lang = normalizeLanguage(headerStore.get('x-next-intl-locale') ?? cookieStore.get(LANGUAGE_COOKIE)?.value);
  const messages = await getMessages({ locale: lang });

  return (
    <html lang={lang} dir={dirFor(lang)} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={lang} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
