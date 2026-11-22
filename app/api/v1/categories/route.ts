import { NextResponse } from 'next/server';
import { categoryService } from '@/lib/services/categoryService';

export async function GET() {
  try {
    const categories = await categoryService.listActiveCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    if ((error as any)?.digest?.startsWith?.('NEXT_PRERENDER')) {
      throw error;
    }
    console.error('[API] /api/v1/categories GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve categories',
      },
      { status: 500 }
    );
  }
}
