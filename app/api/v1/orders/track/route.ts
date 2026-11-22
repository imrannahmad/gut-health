import { NextResponse } from 'next/server';
import { orderTrackingService } from '@/lib/services/orderTrackingService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const trackingInfo = await orderTrackingService.getPublicTrackingInfo(body);

    if (!trackingInfo) {
      return NextResponse.json(
        { success: false, error: 'No order found matching the provided reference number.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trackingInfo,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/orders/track POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve tracking details',
      },
      { status: 400 }
    );
  }
}
