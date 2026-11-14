/**
 * GutGlow Firebase App Check Client Initialization
 * Attests that requests originating from the client browser are authentic
 * and from the official GutGlow domain/application.
 */

import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { app } from './client';

let appCheckInstance: AppCheck | null = null;

export function initAppCheck(): AppCheck | null {
  // App Check only runs in browser environments
  if (typeof window === 'undefined') return null;
  if (appCheckInstance) return appCheckInstance;

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const isDev = process.env.NODE_ENV === 'development';

  // In local development, enable Firebase App Check debug token
  if (isDev && typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
      process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN || true;
  }

  if (!siteKey) {
    if (isDev) {
      console.info(
        '[AppCheck] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined. App Check running in development debug mode.'
      );
    }
    return null;
  }

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    console.info('[AppCheck] Initialized successfully with ReCaptchaV3Provider.');
    return appCheckInstance;
  } catch (err) {
    console.warn('[AppCheck] Initialization warning:', err);
    return null;
  }
}
