'use client';

import Script from 'next/script';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
// Google's renderButton() caps its rendered width at 400px.
const GOOGLE_BUTTON_MAX_WIDTH = 400;
// If Google's script never becomes usable within this window (blocked by an
// extension/firewall, or a request that hangs), drop the button rather than
// leave a skeleton forever — email sign-in is right below it either way.
const SCRIPT_TIMEOUT_MS = 8_000;
// Upper bound on animation-frame attempts to confirm the iframe actually
// painted after we call renderButton — a finite fallback so a never-appearing
// button becomes "hidden", never a permanent skeleton (~90 frames ≈ 1.5s).
const MAX_RENDER_ATTEMPTS = 90;

/**
 * "Continue with Google" using Google Identity Services' own renderButton().
 *
 * Why renderButton and not a fully custom button: the backend
 * (apps/api .../google-auth.service.ts) verifies a Google ID TOKEN, and the
 * only reliable client-side flow that yields an ID token from a button is
 * renderButton — its callback receives `credential` (the ID token) exactly as
 * the existing /api/auth/google route already expects, so nothing on the
 * backend changes. The previous custom button called
 * google.accounts.id.prompt() (One Tap) on click instead; One Tap is designed
 * to auto-surface on page load, not be summoned by a click, and Google was
 * simply *skipping* it (verified live: prompt() returned isSkippedMoment with
 * "unknown_reason"), so clicking it never actually signed anyone in.
 *
 * This component has a bug-prone history (see git log: stuck skeleton,
 * infinite rebuild loop, blank box). The three things that caused those, and
 * how each is handled here:
 *  1. Parent re-renders rebuilding the iframe: AuthCard passes fresh inline
 *     onSuccess/onError arrows on every keystroke/toggle. They live in a ref
 *     here, so this component's render logic never depends on them and a
 *     parent re-render can't tear the button down.
 *  2. The width ResizeObserver watching the element it rebuilds: it watches
 *     the STABLE outer wrapper instead (sized by page layout), and only
 *     re-draws on a genuine width change.
 *  3. Not-ready paths leaving a permanent skeleton: both the script load and
 *     the render-confirm loop are bounded and fall back to hiding the button.
 */
export function GoogleSignInButton({
  lang,
  disabled,
  onSuccess,
  onError,
}: {
  /** Only matters for brand-new accounts — see AuthService.userGoogleAuth. */
  lang: string;
  /** e.g. register mode's consent checkbox not yet ticked. */
  disabled?: boolean;
  onSuccess: (profileComplete: boolean) => void;
  /** Caller shows its own fixed, translated error copy — this is just a signal. */
  onError: () => void;
}) {
  const { resolvedTheme } = useTheme();

  // outerRef: stable wrapper, sized by the page layout (w-full) — safe to
  // measure/observe. containerRef: the element the Google iframe lives in,
  // cleared and rebuilt by draw() — never observe this one.
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const lastWidthRef = useRef(0);

  // AuthCard passes fresh inline onSuccess/onError arrows on every re-render;
  // holding them in a ref keeps the effects below from depending on them.
  const handlersRef = useRef({ lang, onSuccess, onError });
  handlersRef.current = { lang, onSuccess, onError };

  const [scriptReady, setScriptReady] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [pending, setPending] = useState(false);

  // On (re)mount, if the GSI script already loaded during an earlier mount
  // (e.g. the user toggled Admin↔User, unmounting and remounting this
  // component), next/script's <Script onLoad> below won't fire again — so
  // detect the already-attached global directly. Without this, a remount sits
  // on the skeleton until the load-timeout hides the button entirely.
  useEffect(() => {
    if (window.google?.accounts?.id) setScriptReady(true);
  }, []);

  const handleCredential = useCallback(async (idToken: string) => {
    const { lang, onSuccess, onError } = handlersRef.current;
    setPending(true);
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
  }, []);

  // Draw Google's button once its prerequisites (script attached, a measurable
  // width) are met. Returns true only once it has actually called
  // renderButton, so the confirm loop below knows to stop retrying the draw.
  const draw = useCallback(() => {
    const container = containerRef.current;
    const outer = outerRef.current;
    if (!container || !outer || !window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return false;

    const width = Math.min(GOOGLE_BUTTON_MAX_WIDTH, Math.round(outer.clientWidth));
    if (width < 1) return false; // layout not settled yet

    if (!initializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => void handleCredential(response.credential),
        use_fedcm_for_prompt: true,
      });
      initializedRef.current = true;
    }

    lastWidthRef.current = width;
    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: resolvedTheme === 'dark' ? 'filled_black' : 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      logo_alignment: 'center',
      width,
    });
    return true;
  }, [handleCredential, resolvedTheme]);

  // Bounded wait on the script itself — if onLoad never fires, hide the button.
  useEffect(() => {
    if (scriptReady || unavailable) return;
    const timeout = setTimeout(() => setUnavailable(true), SCRIPT_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [scriptReady, unavailable]);

  // Once the script is ready: draw once (retrying only until prerequisites are
  // met), then poll for the iframe to actually appear. Re-runs on theme change
  // to redraw in the new theme. Bounded so we never sit on a permanent skeleton.
  useEffect(() => {
    if (!scriptReady) return;
    let raf = 0;
    let attempts = 0;
    let drawn = false;
    const step = () => {
      if (!drawn) drawn = draw();
      if (drawn && containerRef.current?.querySelector('iframe')) {
        setRendered(true);
        return;
      }
      if (++attempts > MAX_RENDER_ATTEMPTS) {
        setUnavailable(true);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [scriptReady, draw]);

  // Re-draw on a genuine width change only (viewport resize), observing the
  // STABLE outer wrapper — never the container the iframe lives in.
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || !rendered) return;
    const observer = new ResizeObserver(() => {
      const width = Math.min(GOOGLE_BUTTON_MAX_WIDTH, Math.round(outer.clientWidth));
      if (width && width !== lastWidthRef.current) draw();
    });
    observer.observe(outer);
    return () => observer.disconnect();
  }, [rendered, draw]);

  if (!GOOGLE_CLIENT_ID || unavailable) return null;

  return (
    <div ref={outerRef} className="relative w-full">
      <Script
        // `hl` localizes Google's own button text ("Continue with Google" → its
        // translation) — there's no such option on renderButton() itself.
        src={`https://accounts.google.com/gsi/client?hl=${encodeURIComponent(lang)}`}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setUnavailable(true)}
      />
      <div ref={containerRef} className="flex min-h-10 w-full justify-center" aria-busy={pending || undefined} />
      {!rendered ? <Skeleton className="absolute inset-0 h-10 w-full rounded-md" /> : null}
      {disabled ? <div className="absolute inset-0 cursor-not-allowed rounded-md bg-background/60" aria-hidden="true" /> : null}
    </div>
  );
}
