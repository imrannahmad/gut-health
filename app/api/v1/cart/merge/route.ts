import { NextResponse } from 'next/server';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';
import { cartService } from '@/lib/services/cartService';

export async function POST(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const mergedCart = await cartService.mergeCart(auth.uid, body);

    return NextResponse.json({
      success: true,
      data: mergedCart,
    });
  } catch (error) {
    console.error('[API] /api/v1/cart/merge POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to merge cart' },
      { status: 400 }
    );
  }
}
