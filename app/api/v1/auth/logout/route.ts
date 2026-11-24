import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (sessionCookie) {
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
        // Revoke all refresh tokens for this user
        await adminAuth.revokeRefreshTokens(decodedClaims.sub);
      } catch (err) {
        // Token might already be expired or invalid; continue with clearing cookie
        console.warn('[Auth Logout] Token revocation notice:', err);
      }
    }

    const acceptHeader = request.headers.get('accept') || '';
    const contentType = request.headers.get('content-type') || '';
    const isFetchJson = contentType.includes('application/json');

    // If browser form submission (not client fetch JSON), redirect back to login page
    if (!isFetchJson && (acceptHeader.includes('text/html') || contentType.includes('application/x-www-form-urlencoded'))) {
      const redirectUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(redirectUrl, { status: 303 });
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    const response = NextResponse.json(
      { status: 'success', message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear session cookie
    response.cookies.delete(ADMIN_COOKIE_NAME);

    return response;
  } catch (error: unknown) {
    console.error('[Auth Logout API Error]:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const redirectUrl = new URL('/admin/login', request.url);
  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
