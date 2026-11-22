import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { categoryService } from '@/lib/services/categoryService';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(sessionCookie);
}

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin.role, 'products:read') && !hasPermission(admin.role, 'settings:read'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const categories = await categoryService.listAllCategoriesForAdmin();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    if ((error as any)?.digest?.startsWith?.('NEXT_PRERENDER')) {
      throw error;
    }
    console.error('[API] /api/v1/admin/categories GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin.role, 'products:write') && !hasPermission(admin.role, 'settings:write'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const createdCategory = await categoryService.createCategory(body);

    // Immutable Audit Log
    await adminDb.collection('adminLogs').add({
      action: 'category.created',
      entityType: 'category',
      entityId: createdCategory.id,
      performedBy: admin.email || admin.uid,
      metadata: {
        categoryName: createdCategory.name,
        slug: createdCategory.slug,
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        data: createdCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] /api/v1/admin/categories POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      },
      { status: 400 }
    );
  }
}
