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

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'products:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;

    const result = await productService.listAllProductsForAdmin(limit);

    return NextResponse.json({
      success: true,
      data: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    if ((error as any)?.digest?.startsWith?.('NEXT_PRERENDER')) {
      throw error;
    }
    console.error('[API] /api/v1/admin/products GET error:', error);
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
    if (!admin || !hasPermission(admin.role, 'products:write')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const createdProduct = await productService.createProduct(body);

    // Audit Log Entry
    await adminDb.collection('adminLogs').add({
      action: 'product.created',
      entityType: 'product',
      entityId: createdProduct.id,
      performedBy: admin.email || admin.uid,
      metadata: {
        productName: createdProduct.name,
        slug: createdProduct.slug,
        baseSku: createdProduct.baseSku,
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        data: createdProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] /api/v1/admin/products POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      },
      { status: 400 }
    );
  }
}
