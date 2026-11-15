import { NextResponse } from 'next/server';
import { productService } from '@/lib/services/productService';

export async function GET(
  _request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, error: `Product with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    if ((error as any)?.digest?.startsWith?.('NEXT_PRERENDER')) {
      throw error;
    }
    console.error('[API] /api/v1/products/[slug] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
