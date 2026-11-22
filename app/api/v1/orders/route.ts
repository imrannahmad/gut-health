import { NextResponse } from 'next/server';
import { orderService } from '@/lib/services/orderService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await orderService.createOrder(body);

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/orders POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 400 }
    );
  }
}
