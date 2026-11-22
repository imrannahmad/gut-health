import { NextResponse } from 'next/server';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';
import { wishlistService } from '@/lib/services/wishlistService';

export async function GET(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const items = await wishlistService.listWishlist(auth.uid);
    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/wishlist GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const item = await wishlistService.addToWishlist(auth.uid, body);

    return NextResponse.json(
      {
        success: true,
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] /api/v1/wishlist POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to add to wishlist' },
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

    const { searchParams } = new URL(request.url);
    let productId = searchParams.get('productId');

    if (!productId) {
      try {
        const body = await request.json();
        productId = body?.productId;
      } catch {
        // Body was empty or not JSON
      }
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId query param or body is required' },
        { status: 400 }
      );
    }

    await wishlistService.removeFromWishlist(auth.uid, productId);
    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('[API] /api/v1/wishlist DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to remove from wishlist' },
      { status: 400 }
    );
  }
}
