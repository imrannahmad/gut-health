import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { FieldValue } from 'firebase-admin/firestore';
import type { FirestoreSupportQuery, SupportQueryStatus } from '@/types/firestore';

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(sessionCookie);
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') || 'all';
    const searchQuery = searchParams.get('search')?.toLowerCase().trim() || '';

    // Fetch all queries to calculate counts and allow in-memory filtering
    const snapshot = await adminDb
      .collection('support_queries')
      .orderBy('createdAt', 'desc')
      .limit(150)
      .get();

    const allQueries: FirestoreSupportQuery[] = [];
    const counts = {
      all: 0,
      new: 0,
      in_progress: 0,
      resolved: 0,
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      const item: FirestoreSupportQuery = {
        id: doc.id,
        name: data.name || 'Anonymous',
        email: data.email || '',
        phone: data.phone || undefined,
        subject: data.subject || 'General Inquiry',
        message: data.message || '',
        status: (data.status as SupportQueryStatus) || 'new',
        adminNotes: data.adminNotes || '',
        resolvedAt: data.resolvedAt || undefined,
        resolvedBy: data.resolvedBy || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      allQueries.push(item);
      counts.all++;
      if (item.status === 'new') counts.new++;
      else if (item.status === 'in_progress') counts.in_progress++;
      else if (item.status === 'resolved') counts.resolved++;
    });

    // Apply filtering
    let filtered = allQueries;

    if (statusParam !== 'all') {
      filtered = filtered.filter((q) => q.status === statusParam);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (q) =>
          q.name.toLowerCase().includes(searchQuery) ||
          q.email.toLowerCase().includes(searchQuery) ||
          (q.phone && q.phone.includes(searchQuery)) ||
          q.subject.toLowerCase().includes(searchQuery) ||
          q.id.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      counts,
    });
  } catch (error) {
    console.error('[API /api/v1/admin/queries] GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Query ID is required' }, { status: 400 });
    }

    const docRef = adminDb.collection('support_queries').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Support query not found' }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status) {
      updatePayload.status = status;
      if (status === 'resolved') {
        updatePayload.resolvedAt = FieldValue.serverTimestamp();
        updatePayload.resolvedBy = admin.email || 'Admin';
      }
    }

    if (adminNotes !== undefined) {
      updatePayload.adminNotes = String(adminNotes).trim();
    }

    await docRef.update(updatePayload);

    return NextResponse.json({
      success: true,
      message: 'Support query updated successfully',
    });
  } catch (error) {
    console.error('[API /api/v1/admin/queries] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
