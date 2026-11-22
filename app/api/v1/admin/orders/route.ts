import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { orderService } from '@/lib/services/orderService';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(sessionCookie);
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'orders:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filterInput = {
      status: searchParams.get('status') || undefined,
      paymentMode: searchParams.get('paymentMode') || undefined,
      advancePaymentStatus: searchParams.get('advancePaymentStatus') || undefined,
      balanceCollectionStatus: searchParams.get('balanceCollectionStatus') || undefined,
      shipmentStatus: searchParams.get('shipmentStatus') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
    };

    const orders = await orderService.listOrdersForAdmin(filterInput);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        total: orders.length,
        limit: filterInput.limit,
        page: filterInput.page,
      },
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/admin/orders GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
