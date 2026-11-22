import { NextResponse } from 'next/server';
import { couponService } from '@/lib/services/couponService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await couponService.validateCoupon(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/coupons/validate POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid coupon code',
      },
      { status: 400 }
    );
  }
}
