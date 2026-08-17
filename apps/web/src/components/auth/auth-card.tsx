'use client';

import Link from 'next/link';
import { CATEGORIES, type Category } from '@silence/shared';
import { Loader2, MoonStar } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_LANGUAGE, LANGUAGES } from '@/lib/i18n';
import { DEFAULT_CATEGORY } from '@/lib/session-preferences';
import { PlacesAutocomplete } from '@/components/shared/places-autocomplete';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';

type Mode = 'login' | 'register';

type PlaceState = {
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  timezone?: string;
};

function localizedPath(pathname: string, path: string) {
  const [, maybeLocale] = pathname.split('/');
  return maybeLocale && maybeLocale.length === 2 ? `/${maybeLocale}${path}` : path;
}

export function AuthCard({
  mode,
  initialLanguage = DEFAULT_LANGUAGE,
  initialCategory = DEFAULT_CATEGORY,
}: {
  mode: Mode;
  initialLanguage?: string;
  initialCategory?: Category;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Auth');
  // The page's actual rendered locale (from the URL/next-intl), not
  // initialLanguage — that's only the register form's language <select>
  // default and isn't even passed on /login. Google's button text (via the
  // gsi/client script's `hl` param) should match what the page is in.
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceState>({ city: '', country: '' });
  const registering = mode === 'register';

  async function submitAuth(formData: FormData) {
    const response = await fetch(registering ? '/api/auth/register' : '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        registering
          ? {
              name: String(formData.get('name') ?? ''),
              category: formData.get('category'),
              dob: String(formData.get('dob') ?? ''),
              timeOfBirth: String(formData.get('timeOfBirth') ?? ''),
              placeOfBirth: {
                city: place.city || String(formData.get('city') ?? ''),
                country: place.country || String(formData.get('country') ?? ''),
                lat: place.lat,
                lng: place.lng,
                timezone: place.timezone,
              },
              contact: String(formData.get('contact') ?? ''),
              password: String(formData.get('password') ?? ''),
              lang: String(formData.get('lang') ?? initialLanguage),
              consent: formData.get('consent') === 'on',
            }
          : {
              contact: String(formData.get('contact') ?? ''),
              password: String(formData.get('password') ?? ''),
            },
      ),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error?.message ?? t(registering ? 'registerError' : 'loginError'));
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MoonStar className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">
              {registering ? t('createTitle') : t('welcomeBack')}
            </h1>
            <p className="text-sm text-muted-foreground">Silence</p>
          </div>
        </div>

        <div className="mt-6">
          <GoogleSignInButton
            mode={mode}
            lang={locale}
            label={t('continueWithGoogle')}
            onSuccess={(profileComplete) => {
              setError(null);
              router.push(localizedPath(pathname, profileComplete ? '/app' : '/profile?onboarding=1'));
              router.refresh();
            }}
            onError={() => setError(t('googleSignInError'))}
          />
          <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t('orContinueWithEmail')}
            <span className="h-px flex-1 bg-border" />
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);

            try {
              await submitAuth(new FormData(event.currentTarget));
              router.push(localizedPath(pathname, '/app'));
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : t(registering ? 'registerError' : 'loginError'));
              setPending(false);
            }
          }}
        >
          {registering ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" name="name" autoComplete="name" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('category')}</Label>
                  <select
                    id="category"
                    name="category"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue={initialCategory}
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {t(`categories.${category}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lang">{t('language')}</Label>
                  <select
                    id="lang"
                    name="lang"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue={initialLanguage}
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dob">{t('dob')}</Label>
                  <Input id="dob" name="dob" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeOfBirth">{t('timeOfBirth')}</Label>
                  <Input id="timeOfBirth" name="timeOfBirth" type="time" required />
                </div>
              </div>
              <PlacesAutocomplete
                id="city"
                label={t('birthPlace')}
                placeholder={t('birthPlacePlaceholder')}
                onSelect={(p) => setPlace(p)}
                required
              />
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="contact">{t('contact')}</Label>
            <Input id="contact" name="contact" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('password')}</Label>
              {registering ? null : (
                <Link href="/forgot-password" className="text-xs font-medium text-primary">
                  {t('forgotPassword')}
                </Link>
              )}
            </div>
            <Input id="password" name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} required />
          </div>

          {registering ? (
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input name="consent" type="checkbox" className="mt-1 size-4 rounded border-border" required />
              <span>{t('consent')}</span>
            </label>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {registering ? t('createSubmit') : t('signInSubmit')}
          </Button>
        </form>

        <div className="mt-5 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          {registering ? t('alreadyHaveProfile') : t('newToSilence')}{' '}
          <Link href={registering ? '/login' : '/register'} className="font-medium text-primary">
            {registering ? t('signInSubmit') : t('createOne')}
          </Link>
        </div>
      </div>
    </div>
  );
}
