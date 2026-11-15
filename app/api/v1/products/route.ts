import { NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 20;

    const result = await productService.listActiveProducts(limit);

    return NextResponse.json({
      success: true,
      data: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    // Allow Next.js prerender bailouts to bubble up cleanly
    if ((error as any)?.digest?.startsWith?.('NEXT_PRERENDER')) {
      throw error;
    }
    console.error('[API] /api/v1/products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve products',
      },
      { status: 500 }
    );
  }
}
