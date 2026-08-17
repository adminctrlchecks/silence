'use client';

import Script from 'next/script';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleSignInButton({
  mode,
  lang,
  disabled,
  onSuccess,
  onError,
  label,
}: {
  mode: 'login' | 'register';
  /** Only matters for brand-new accounts — see AuthService.userGoogleAuth. */
  lang: string;
  /** e.g. register mode's consent checkbox not yet ticked. */
  disabled?: boolean;
  onSuccess: (profileComplete: boolean) => void;
  onError: (message: string) => void;
  label: string;
}) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [pending, setPending] = useState(false);

  const handleCredential = useCallback(
    async (idToken: string) => {
      setPending(true);
      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, lang }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error?.message ?? label);
        }
        onSuccess(Boolean(data?.profileComplete));
      } catch (err) {
        setPending(false);
        onError(err instanceof Error ? err.message : label);
      }
    },
    [lang, label, onSuccess, onError],
  );

  const render = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (!scriptReady || !containerRef.current || !GOOGLE_CLIENT_ID) return;

    if (!window.google?.accounts?.id) {
      // The script's load event has occasionally been observed firing a tick
      // before window.google is fully attached (network/timing-dependent) —
      // rather than leave the skeleton stuck forever, retry briefly. Self-heals
      // instead of requiring a manual refresh.
      retryTimeoutRef.current = setTimeout(render, 100);
      return;
    }

    try {
      if (!initializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            void handleCredential(response.credential);
          },
          use_fedcm_for_prompt: true,
        });
        initializedRef.current = true;
      }

      containerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'rectangular',
        text: mode === 'register' ? 'signup_with' : 'signin_with',
        logo_alignment: 'left',
        width: Math.round(containerRef.current.clientWidth) || 336,
      });
    } catch {
      // A thrown initialize()/renderButton() call would otherwise leave the
      // skeleton stuck with no visible feedback — surface it like any other
      // sign-in failure instead.
      onError(label);
    }
  }, [scriptReady, resolvedTheme, mode, lang, handleCredential, onError, label]);

  useEffect(() => {
    render();
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [render]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => render());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [render]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="relative w-full">
      <Script
        // `hl` is how GIS localizes the *button's own* text (e.g. "Sign in with
        // Google" -> its Arabic equivalent) — there's no such option on
        // renderButton() itself, only on the script URL.
        src={`https://accounts.google.com/gsi/client?hl=${encodeURIComponent(lang)}`}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => onError(label)}
      />
      {!scriptReady ? <Skeleton className="h-10 w-full rounded-md" /> : null}
      <div
        ref={containerRef}
        className="flex w-full justify-center [&_iframe]:!w-full"
        style={{ visibility: scriptReady ? 'visible' : 'hidden', height: scriptReady ? undefined : 0 }}
        aria-busy={pending}
      />
      {disabled ? (
        <div className="absolute inset-0 cursor-not-allowed rounded-md bg-background/60" aria-hidden="true" />
      ) : null}
    </div>
  );
}
