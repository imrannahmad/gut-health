import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { customerService } from '@/lib/services/customerService';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(sessionCookie);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'orders:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id: customerId } = await params;
    const notes = await customerService.listSupportNotes(customerId);

    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/admin/customers/[id]/notes GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'orders:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id: customerId } = await params;
    const body = await request.json();

    const note = await customerService.addSupportNote(
      customerId,
      {
        id: admin.uid,
        name: admin.email?.split('@')[0] || 'Admin',
        email: admin.email || 'imrannahmd@gmail.com',
      },
      body
    );

    // Immutable audit log
    await adminDb.collection('adminLogs').add({
      action: 'customer.note_added',
      entityType: 'customer',
      entityId: customerId,
      performedBy: admin.email || admin.uid,
      metadata: {
        noteId: note.id,
        preview: note.note.substring(0, 50),
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        data: note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] /api/v1/admin/customers/[id]/notes POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add support note',
      },
      { status: 400 }
    );
  }
}
