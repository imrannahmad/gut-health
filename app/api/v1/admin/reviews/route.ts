import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { reviewService } from '@/lib/services/reviewService';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { ListAdminReviewsQuerySchema } from '@/lib/validations/reviewSchema';

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(sessionCookie);
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin || !hasPermission(admin.role, 'reviews:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = ListAdminReviewsQuerySchema.parse({
      productId: searchParams.get('productId') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    const result = await reviewService.listReviewsForAdmin(query);

    return NextResponse.json({
      success: true,
      data: result.reviews,
      meta: result.pagination,
    });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/admin/reviews GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
