import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requested = locale ?? (await requestLocale);
  const resolvedLocale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
