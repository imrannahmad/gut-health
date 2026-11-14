import { NextResponse } from 'next/server';
import { adminApp, adminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const appName = adminApp.name;
    const projectId = adminApp.options.projectId || process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    let firestoreStatus = 'configured';
    try {
      // Safe read-only check: attempt to list collections without writing any document
      await adminDb.listCollections();
      firestoreStatus = 'connected';
    } catch (dbErr: unknown) {
      const msg = dbErr instanceof Error ? dbErr.message : 'Database uninitialized or unreachable';
      firestoreStatus = `configured (${msg})`;
    }

    return NextResponse.json(
      {
        status: 'healthy',
        version: '2.3.1',
        timestamp: new Date().toISOString(),
        region: process.env.NEXT_PUBLIC_FIREBASE_REGION || 'asia-south1',
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
        services: {
          adminSdk: appName ? 'initialized' : 'failed',
          projectId: projectId || 'unknown',
          firestore: firestoreStatus,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        status: 'unhealthy',
        version: '2.3.1',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
