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

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin.role, 'products:read') && !hasPermission(admin.role, 'settings:read'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;
    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    if ((error as any)?.digest?.startsWith?.('NEXT_PRERENDER')) {
      throw error;
    }
    console.error('[API] /api/v1/admin/categories/[id] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin.role, 'products:write') && !hasPermission(admin.role, 'settings:write'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;
    const body = await request.json();

    await categoryService.updateCategory(id, body);

    // Audit Log Entry
    await adminDb.collection('adminLogs').add({
      action: 'category.updated',
      entityType: 'category',
      entityId: id,
      performedBy: admin.email || admin.uid,
      metadata: { updatedFields: Object.keys(body) },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    console.error('[API] /api/v1/admin/categories/[id] PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || (!hasPermission(admin.role, 'products:write') && !hasPermission(admin.role, 'settings:write'))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;
    const result = await categoryService.deleteCategory(id);

    // Audit Log Entry
    await adminDb.collection('adminLogs').add({
      action: result.action === 'deleted' ? 'category.deleted' : 'category.deactivated',
      entityType: 'category',
      entityId: id,
      performedBy: admin.email || admin.uid,
      metadata: { resultMessage: result.message },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API] /api/v1/admin/categories/[id] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      },
      { status: 400 }
    );
  }
}
