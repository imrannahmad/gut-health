/**
 * GutGlow Server-Side Firebase App Check Token Verifier
 * Validates 'X-Firebase-AppCheck' HTTP request header to block unauthorized API probes,
 * bots, and non-storefront scrapers.
 */

import { adminApp } from './admin';
import { getAppCheck } from 'firebase-admin/app-check';

export interface AppCheckVerificationResult {
  isValid: boolean;
  appId?: string;
  error?: string;
}

export async function verifyAppCheckToken(
  request: Request,
  strictEnforcement: boolean = false
): Promise<AppCheckVerificationResult> {
  const isDev = process.env.NODE_ENV === 'development';
  const appCheckToken = request.headers.get('X-Firebase-AppCheck');

  // In development, if token is not provided and not strictly enforced, allow
  if (!appCheckToken) {
    if (isDev || !strictEnforcement) {
      return { isValid: true };
    }
    return {
      isValid: false,
      error: 'Missing required X-Firebase-AppCheck attestation header.',
    };
  }

  try {
    const appCheck = getAppCheck(adminApp);
    const decodedToken = await appCheck.verifyToken(appCheckToken);

    return {
      isValid: true,
      appId: decodedToken.appId,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid App Check token';
    console.warn('[AppCheck Server Warning]: Verification failed:', msg);

    if (strictEnforcement) {
      return {
        isValid: false,
        error: `App Check verification failed: ${msg}`,
      };
    }

    // In non-strict mode, log warning but do not break legitimate fallback traffic
    return {
      isValid: true,
      error: msg,
    };
  }
}
