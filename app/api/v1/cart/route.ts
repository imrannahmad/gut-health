import { NextResponse } from 'next/server';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';
import { cartService } from '@/lib/services/cartService';

export async function GET(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await cartService.getCart(auth.uid);
    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/cart GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updatedCart = await cartService.saveCart(auth.uid, body);

    return NextResponse.json({
      success: true,
      data: updatedCart,
    });
  } catch (error) {
    console.error('[API] /api/v1/cart PUT error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update cart' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await cartService.clearCart(auth.uid);
    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('[API] /api/v1/cart DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to clear cart' },
      { status: 400 }
    );
  }
}
