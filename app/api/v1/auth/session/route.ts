import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import type { AdminRole } from '@/types/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'idToken is required and must be a valid string' },
        { status: 400 }
      );
    }

    // 1. Verify Firebase ID Token
    const decodedIdToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decodedIdToken;

    // 2. 5 days session duration in milliseconds
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // 3. Create Firebase Session Cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // 4. Check if user is registered in 'admins' collection
    let role: AdminRole | null = (decodedIdToken.role as AdminRole) || null;
    if (!role) {
      const adminDoc = await adminDb.collection('admins').doc(uid).get();
      if (adminDoc.exists && adminDoc.data()?.isActive) {
        role = adminDoc.data()?.role as AdminRole;
        // Sync custom claim if missing
        await adminAuth.setCustomUserClaims(uid, { role });
      }
    }

    const response = NextResponse.json(
      {
        status: 'success',
        user: {
          uid,
          email,
          role,
        },
      },
      { status: 200 }
    );

    // Set Secure HTTP-Only Cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set(ADMIN_COOKIE_NAME, sessionCookie, {
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('[Auth Session API Error]:', error);
    const msg = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.json(
      { error: 'Failed to create session', details: msg },
      { status: 401 }
    );
  }
}
