import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { customerService } from '@/lib/services/customerService';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';

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
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }

    const customerDetails = await customerService.getCustomerDetailForAdmin(customerId);
    if (!customerDetails) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: customerDetails,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/admin/customers/[id] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
