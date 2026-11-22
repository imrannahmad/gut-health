import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { AdminReviewClaimSchema } from '@/lib/validations/claimSchema';
import { claimService } from '@/lib/services/claimService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const admin = await verifyAdminSession(sessionCookie);

    if (!admin || !hasPermission(admin.role, 'returns:write')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = AdminReviewClaimSchema.parse(body);

    const result = await claimService.reviewClaim(id, { uid: admin.uid, email: admin.email }, validated);

    return NextResponse.json({
      success: true,
      data: result.claim,
      replacementOrderId: result.replacementOrderId,
      message:
        validated.action === 'approve_replacement'
          ? `Claim approved. 100% Free Replacement Order (${result.replacementOrderId}) created successfully.`
          : validated.action === 'reject'
          ? 'Claim rejected.'
          : 'Refund recorded successfully.',
    });
  } catch (error: any) {
    console.error('[API] /api/v1/admin/returns/[id]/inspect error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.errors?.[0]?.message || error.message || 'Failed to review claim',
      },
      { status: 400 }
    );
  }
}
