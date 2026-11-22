import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { orderService } from '@/lib/services/orderService';
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

    const { id: orderId } = await params;
    const order = await orderService.getOrder(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const events = await orderService.getOrderEvents(orderId);

    return NextResponse.json({
      success: true,
      data: {
        order,
        events,
      },
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/admin/orders/[id] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'orders:write')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id: orderId } = await params;
    const body = await request.json();

    const updatedOrder = await orderService.updateOrderStatus(
      orderId,
      body,
      'ADMIN',
      admin.uid
    );

    // Immutable administrative audit log
    await adminDb.collection('adminLogs').add({
      action: 'order.status_updated',
      entityType: 'order',
      entityId: orderId,
      performedBy: admin.email || admin.uid,
      metadata: body,
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('[API] /api/v1/admin/orders/[id] PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order',
      },
      { status: 400 }
    );
  }
}
