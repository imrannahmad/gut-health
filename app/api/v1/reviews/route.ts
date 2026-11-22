import { NextResponse } from 'next/server';
import { reviewService } from '@/lib/services/reviewService';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';
import { ListPublicReviewsQuerySchema } from '@/lib/validations/reviewSchema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = ListPublicReviewsQuerySchema.parse({
      productId: searchParams.get('productId') || searchParams.get('product') || '',
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
      sort: searchParams.get('sort') || 'latest',
    });

    const result = await reviewService.getPublicReviews(query);

    return NextResponse.json({
      success: true,
      data: result.reviews,
      stats: result.stats,
      meta: result.pagination,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/reviews GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve reviews',
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    const body = await request.json();

    const result = await reviewService.submitReview(
      body,
      auth
        ? {
            uid: auth.uid,
            email: auth.email,
            name: auth.name,
          }
        : undefined
    );

    return NextResponse.json(
      {
        success: true,
        data: result.review,
        message: result.message,
      },
      { status: 201 }
    );
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/reviews POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit review';

    const statusCode =
      message.includes('not exist') || message.includes('not found')
        ? 404
        : message.includes('Verification failed')
        ? 403
        : message.includes('already been submitted')
        ? 409
        : 400;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }
}
