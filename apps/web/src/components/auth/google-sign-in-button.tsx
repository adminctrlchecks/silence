'use client';

import Script from 'next/script';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
// Some FedCM failure modes (confirmed in testing: the browser has no Google
// session at all, so FedCM's get() rejects with a NetworkError) never invoke
// prompt()'s moment-notification callback at all — GSI just logs it and goes
// quiet, which would otherwise leave the button stuck disabled/pending
// forever. This is the safety net: if nothing has resolved the click within
// this window, treat it as failed. Long enough that it never fires while a
// real account-chooser is genuinely still on screen waiting on the user.
const PROMPT_TIMEOUT_MS = 12_000;
// Separate, earlier safety net for the *script load* phase itself — the bug
// above only covered a click that had already started. If Google's script
// never loads at all (blocked by an extension/firewall, or a request that
// hangs instead of firing either `onLoad` or `onError`), the button used to
// have no time limit on that either and would just sit there disabled with a
// spinner forever, every time, for anyone it happened to. If it hasn't
// loaded within this window, stop waiting and quietly drop the button —
// email sign-in is right below it either way, so a missing Google option
// beats a permanently broken-looking one.
const SCRIPT_LOAD_TIMEOUT_MS = 8_000;

// Google's official multi-color "G" glyph, unaltered, per their Sign In With
// Google branding guidelines for custom buttons.
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="size-4 shrink-0" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.85.92 7.5 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * A custom, first-party-styled "Continue with Google" button, replacing the
 * previous approach of embedding Google's own `renderButton()` iframe inline.
 * That iframe depends on third-party-iframe/cookie access from
 * accounts.google.com, which is unreliable in practice — blocked or silently
 * broken by ITP/strict cookie settings and many ad/privacy browser
 * extensions, on top of two prior bugs in this exact component from managing
 * that iframe's DOM lifecycle (stuck skeleton, infinite rebuild loop; see git
 * history). Removing the iframe removes that entire bug class: this button
 * is just our own <Button>, so it always renders, in our own design system,
 * every time. Clicking it calls `prompt()` (FedCM-backed where supported) on
 * the exact same `initialize()`/ID-token `callback` used before — zero
 * backend change, same `/api/auth/google` verification path. If Google can't
 * display anything (browser/privacy settings), it surfaces a clear message
 * instead of leaving a silently broken control, since email sign-in is right
 * below it either way.
 *
 * Two things can still get "stuck" without an explicit way out — both have a
 * timeout-based safety net (see SCRIPT_LOAD_TIMEOUT_MS / PROMPT_TIMEOUT_MS):
 * the initial script load itself (blocked or hung, before any click — the
 * button quietly disappears if this never resolves), and the post-click
 * prompt() call (some FedCM failure modes never invoke its own callback —
 * confirmed live: a NetworkError from FedCM's get() with no Google session
 * in the browser at all).
 */
export function GoogleSignInButton({
  lang,
  disabled,
  onSuccess,
  onError,
  label,
}: {
  /** Only matters for brand-new accounts — see AuthService.userGoogleAuth. */
  lang: string;
  /** e.g. register mode's consent checkbox not yet ticked. */
  disabled?: boolean;
  onSuccess: (profileComplete: boolean) => void;
  /** The caller shows its own fixed, translated error copy — this is just a "something went wrong" signal. */
  onError: () => void;
  label: string;
}) {
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptUnavailable, setScriptUnavailable] = useState(false);
  const [pending, setPending] = useState(false);
  const initializedRef = useRef(false);
  // Guards against the safety timeout, the moment listener, and the real
  // credential callback all racing to resolve the same click — whichever
  // settles first wins, the rest are no-ops.
  const inFlightRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSafetyTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearSafetyTimeout, [clearSafetyTimeout]);

  // The script-load safety net: give up waiting after SCRIPT_LOAD_TIMEOUT_MS
  // and drop the button rather than leave it spinning indefinitely.
  useEffect(() => {
    if (scriptReady || scriptUnavailable) return;
    const timeout = setTimeout(() => setScriptUnavailable(true), SCRIPT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [scriptReady, scriptUnavailable]);

  const fail = useCallback(() => {
    if (!inFlightRef.current) return;
    inFlightRef.current = false;
    clearSafetyTimeout();
    setPending(false);
    onError();
  }, [clearSafetyTimeout, onError]);

  const handleCredential = useCallback(
    async (idToken: string) => {
      inFlightRef.current = false;
      clearSafetyTimeout();
      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, lang }),
        });
        if (!response.ok) {
          setPending(false);
          onError();
          return;
        }
        const data = await response.json().catch(() => null);
        onSuccess(Boolean(data?.profileComplete));
      } catch {
        setPending(false);
        onError();
      }
    },
    [lang, onSuccess, onError, clearSafetyTimeout],
  );

  function handleClick() {
    if (!scriptReady || !window.google?.accounts?.id || !GOOGLE_CLIENT_ID) {
      onError();
      return;
    }

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

    inFlightRef.current = true;
    setPending(true);
    clearSafetyTimeout();
    timeoutRef.current = setTimeout(fail, PROMPT_TIMEOUT_MS);

    window.google.accounts.id.prompt((notification) => {
      // Covers the failure modes that DO invoke this listener (FedCM
      // unsupported, third-party cookies blocked, prior dismissal cooldown).
      // The ones that don't (e.g. a NetworkError from FedCM's get() with no
      // Google session at all) fall through to the safety timeout above.
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        fail();
      }
    });
  }

  function handleScriptLoad() {
    // The load event has occasionally been observed firing a tick before
    // window.google is fully attached (network/timing-dependent) — retry
    // briefly instead of treating that race as a real failure.
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }
    let attempts = 0;
    const retry = setInterval(() => {
      attempts += 1;
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        clearInterval(retry);
      } else if (attempts >= 5) {
        clearInterval(retry);
        // Falls through to the SCRIPT_LOAD_TIMEOUT_MS effect above, which
        // will mark this unavailable shortly after.
      }
    }, 200);
  }

  if (!GOOGLE_CLIENT_ID || scriptUnavailable) return null;

  return (
    <div className="w-full">
      <Script
        // `hl` is how GIS localizes Google's own consent-screen copy for this
        // flow — there's no separate option for it on prompt()/initialize().
        src={`https://accounts.google.com/gsi/client?hl=${encodeURIComponent(lang)}`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={() => setScriptUnavailable(true)}
      />
      <Button type="button" variant="outline" className="w-full" disabled={disabled || pending || !scriptReady} onClick={handleClick}>
        {pending || !scriptReady ? <Loader2 className="animate-spin" /> : <GoogleGlyph />}
        {label}
      </Button>
    </div>
  );
}
