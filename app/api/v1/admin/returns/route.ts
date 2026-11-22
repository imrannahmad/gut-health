import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { AdminClaimFilterSchema } from '@/lib/validations/claimSchema';
import { claimService } from '@/lib/services/claimService';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const admin = await verifyAdminSession(sessionCookie);

    if (!admin || !hasPermission(admin.role, 'returns:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = AdminClaimFilterSchema.parse({
      status: searchParams.get('status') || 'all',
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    });

    const result = await claimService.getClaims(filter);

    return NextResponse.json({
      success: true,
      data: result.claims,
      total: result.total,
      counts: result.counts,
    });
  } catch (error: any) {
    console.error('[API] /api/v1/admin/returns error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.errors?.[0]?.message || error.message || 'Failed to fetch claims',
      },
      { status: 500 }
    );
  }
}
