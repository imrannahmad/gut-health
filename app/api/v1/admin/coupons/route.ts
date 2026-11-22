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

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'coupons:manage')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || undefined;
    const activeOnly = searchParams.get('active') === 'true';

    const coupons = await couponService.listCoupons(search, activeOnly);

    return NextResponse.json({
      success: true,
      data: coupons,
      meta: {
        total: coupons.length,
      },
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/admin/coupons GET error:', error);
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
    if (!admin || !hasPermission(admin.role, 'coupons:manage')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const createdCoupon = await couponService.createCoupon(body);

    // Immutable Audit Log
    await adminDb.collection('adminLogs').add({
      action: 'coupon.created',
      entityType: 'coupon',
      entityId: createdCoupon.code,
      performedBy: admin.email || admin.uid,
      metadata: {
        type: createdCoupon.type,
        value: createdCoupon.value,
        minOrderValueInPaise: createdCoupon.minOrderValueInPaise,
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        data: createdCoupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] /api/v1/admin/coupons POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create coupon',
      },
      { status: 400 }
    );
  }
}
