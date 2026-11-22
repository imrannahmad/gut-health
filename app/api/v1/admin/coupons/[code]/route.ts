import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { couponService } from '@/lib/services/couponService';
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
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'coupons:manage')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { code } = await params;
    const coupon = await couponService.getCoupon(code);
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/admin/coupons/[code] GET error:', error);
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
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'coupons:manage')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { code } = await params;
    const body = await request.json();

    const updatedCoupon = await couponService.updateCoupon(code, body);

    // Audit log
    await adminDb.collection('adminLogs').add({
      action: 'coupon.updated',
      entityType: 'coupon',
      entityId: code.toUpperCase(),
      performedBy: admin.email || admin.uid,
      metadata: body,
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: updatedCoupon,
    });
  } catch (error) {
    console.error('[API] /api/v1/admin/coupons/[code] PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update coupon',
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'coupons:manage')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { code } = await params;
    await couponService.deleteCoupon(code);

    // Audit log
    await adminDb.collection('adminLogs').add({
      action: 'coupon.deleted',
      entityType: 'coupon',
      entityId: code.toUpperCase(),
      performedBy: admin.email || admin.uid,
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: `Coupon "${code}" deleted successfully.`,
    });
  } catch (error) {
    console.error('[API] /api/v1/admin/coupons/[code] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete coupon',
      },
      { status: 400 }
    );
  }
}
