import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { claimService } from '@/lib/services/claimService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const admin = await verifyAdminSession(sessionCookie);

    if (!admin || !hasPermission(admin.role, 'returns:read')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const result = await claimService.getClaimById(id);

    if (!result) {
      return NextResponse.json({ success: false, error: `Claim "${id}" not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API] /api/v1/admin/returns/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch claim details',
      },
      { status: 500 }
    );
  }
}
