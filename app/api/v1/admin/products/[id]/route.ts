import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { productService } from '@/lib/services/productService';
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
    if (!admin || !hasPermission(admin.role, 'products:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    if ((error as any)?.digest?.startsWith?.('NEXT_PRERENDER')) {
      throw error;
    }
    console.error('[API] /api/v1/admin/products/[id] GET error:', error);
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
    if (!admin || !hasPermission(admin.role, 'products:write')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;
    const body = await request.json();

    await productService.updateProduct(id, body);

    // Audit Log Entry
    await adminDb.collection('adminLogs').add({
      action: 'product.updated',
      entityType: 'product',
      entityId: id,
      performedBy: admin.email || admin.uid,
      metadata: { updatedFields: Object.keys(body) },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('[API] /api/v1/admin/products/[id] PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'products:write')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;
    const { searchParams } = new URL(request.url);
    const isPermanent = searchParams.get('permanent') !== 'false';

    if (isPermanent) {
      await productService.deleteProduct(id);

      // Audit Log Entry
      await adminDb.collection('adminLogs').add({
        action: 'product.deleted',
        entityType: 'product',
        entityId: id,
        performedBy: admin.email || admin.uid,
        timestamp: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, message: 'Product deleted permanently' });
    } else {
      await productService.archiveProduct(id);

      // Audit Log Entry
      await adminDb.collection('adminLogs').add({
        action: 'product.archived',
        entityType: 'product',
        entityId: id,
        performedBy: admin.email || admin.uid,
        timestamp: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, message: 'Product archived successfully' });
    }
  } catch (error) {
    console.error('[API] /api/v1/admin/products/[id] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      },
      { status: 400 }
    );
  }
}
