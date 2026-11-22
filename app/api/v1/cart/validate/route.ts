import { NextResponse } from 'next/server';
import { cartService } from '@/lib/services/cartService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await cartService.validateCart(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/cart/validate POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cart validation failed',
      },
      { status: 400 }
    );
  }
}
