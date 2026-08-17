'use client';

import Link from 'next/link';
import { CATEGORIES, type Category } from '@silence/shared';
import { Check, ChevronLeft, Loader2, MoonStar } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { DEFAULT_LANGUAGE, LANGUAGES } from '@/lib/i18n';
import { DEFAULT_CATEGORY } from '@/lib/session-preferences';
import { PlacesAutocomplete } from '@/components/shared/places-autocomplete';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

type PlaceState = {
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  timezone?: string;
};

// Registration is a progressive 3-step form per
// docs/product-redesign/18-authentication-flows.md §2. Every step's fields
// stay mounted in the same <form> the whole time (only visually/a11y hidden
// via the `hidden` attribute) so nothing is lost switching steps or on a
// submit error. Validation is fully manual (see validateStep) rather than
// relying on the browser's native pre-submit pass, since a merely-`hidden`
// required field isn't reliably excluded from that.
const REGISTER_STEP_KEYS = ['identity', 'birth', 'account'] as const;

function localizedPath(pathname: string, path: string) {
  const [, maybeLocale] = pathname.split('/');
  return maybeLocale && maybeLocale.length === 2 ? `/${maybeLocale}${path}` : path;
}

function StepIndicator({
  currentStep,
  labels,
  stepAnnouncement,
}: {
  currentStep: number;
  labels: string[];
  stepAnnouncement: string;
}) {
  return (
    <nav aria-label="Registration progress" className="mb-6">
      <ol className="flex items-center gap-2">
        {labels.map((label, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isComplete && !isCurrent && 'border-primary bg-primary/10 text-primary',
                  !isCurrent && !isComplete && 'border-border bg-background text-muted-foreground',
                )}
              >
                {isComplete ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:inline',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {index < labels.length - 1 ? (
                <span aria-hidden className={cn('h-px flex-1', isComplete ? 'bg-primary' : 'bg-border')} />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p role="status" aria-live="polite" className="sr-only">
        {stepAnnouncement}
      </p>
    </nav>
  );
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
  const registering = mode === 'register';

  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [place, setPlace] = useState<PlaceState>({ city: '', country: '' });
  const [placeError, setPlaceError] = useState(false);

  const stepRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const isFirstRender = useRef(true);

  const totalSteps = REGISTER_STEP_KEYS.length;
  const stepLabels = REGISTER_STEP_KEYS.map((key) => t(`steps.${key}`));

  // Move focus to the new step's heading when the step changes (but not on
  // first mount) so keyboard/screen-reader users land somewhere meaningful
  // instead of the focus silently staying on the now-hidden "Continue" button.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    stepRefs[step].current?.querySelector<HTMLElement>('[data-step-heading]')?.focus();
  }, [step]);

  function validateStep(index: number) {
    const container = stepRefs[index].current;
    if (!container) return true;
    const fields = container.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select');
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    if (index === 1 && (!place.city || !place.country)) {
      setPlaceError(true);
      container.querySelector<HTMLElement>('#city')?.focus();
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setPlaceError(false);
    setError(null);
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

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

  const legalLinks = {
    terms: (chunks: ReactNode) => (
      <Link href={localizedPath(pathname, '/terms')} className="font-medium underline underline-offset-2">
        {chunks}
      </Link>
    ),
    privacy: (chunks: ReactNode) => (
      <Link href={localizedPath(pathname, '/privacy')} className="font-medium underline underline-offset-2">
        {chunks}
      </Link>
    ),
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MoonStar className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">{t(registering ? 'eyebrowRegister' : 'eyebrowLogin')}</p>
            <h1 className="text-xl font-semibold tracking-normal">
              {registering ? t('createTitle') : t('welcomeBack')}
            </h1>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t(registering ? 'descriptionRegister' : 'descriptionLogin')}
        </p>

        {registering ? (
          <StepIndicator
            currentStep={step}
            labels={stepLabels}
            stepAnnouncement={t('stepProgress', { current: step + 1, total: totalSteps, label: stepLabels[step] })}
          />
        ) : null}

        {!registering || step === 0 ? (
          <div className="mt-5">
            <p className="text-xs leading-5 text-muted-foreground">
              {t.rich('agreementNotice', legalLinks)}
            </p>
            <div className="mt-3">
              <GoogleSignInButton
                mode={mode}
                lang={locale}
                label={t('continueWithGoogle')}
                onSuccess={(profileComplete) => {
                  setError(null);
                  router.push(localizedPath(pathname, profileComplete ? '/app' : '/profile/birth-details?onboarding=1'));
                  router.refresh();
                }}
                onError={() => setError(t('googleSignInError'))}
              />
            </div>
            <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              {t('orContinueWithEmail')}
              <span className="h-px flex-1 bg-border" />
            </div>
          </div>
        ) : null}

        <form
          className="space-y-4"
          // Validation is fully manual (validateStep + field.reportValidity()
          // below): with fields from later steps staying mounted-but-hidden
          // for state preservation, we can't rely on the browser's automatic
          // pre-submit validation pass, which isn't guaranteed to skip
          // required fields that are merely `hidden` rather than removed.
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            if (registering && step !== totalSteps - 1) {
              goNext();
              return;
            }
            if (!validateStep(step)) return;

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
            <div ref={stepRefs[0]} hidden={step !== 0} className="space-y-4">
              <h2 data-step-heading tabIndex={-1} className="text-sm font-semibold text-foreground outline-none">
                {stepLabels[0]}
              </h2>
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
            </div>
          ) : null}

          {registering ? (
            <div ref={stepRefs[1]} hidden={step !== 1} className="space-y-4">
              <h2 data-step-heading tabIndex={-1} className="text-sm font-semibold text-foreground outline-none">
                {stepLabels[1]}
              </h2>
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
                onSelect={(p) => {
                  setPlace(p);
                  setPlaceError(false);
                }}
                required
              />
              {placeError ? (
                <p role="alert" className="text-sm text-destructive">
                  {t('stepValidationError')}
                </p>
              ) : null}
              <Alert variant="info" title={t('birthWhyTitle')}>
                {t('birthWhyBody')}
              </Alert>
            </div>
          ) : null}

          <div ref={stepRefs[2]} hidden={registering && step !== 2} className="space-y-4">
            {registering ? (
              <h2 data-step-heading tabIndex={-1} className="text-sm font-semibold text-foreground outline-none">
                {stepLabels[2]}
              </h2>
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
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={registering ? 'new-password' : 'current-password'}
                required
              />
            </div>

            {registering ? (
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input name="consent" type="checkbox" className="mt-1 size-4 rounded border-border" required />
                <span>{t.rich('consent', legalLinks)}</span>
              </label>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            {registering && step > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} disabled={pending}>
                <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
                {t('back')}
              </Button>
            ) : null}
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              {registering
                ? step === totalSteps - 1
                  ? t('createSubmit')
                  : t('continue')
                : t('signInSubmit')}
            </Button>
          </div>
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
