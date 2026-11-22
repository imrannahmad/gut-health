import { NextResponse } from 'next/server';
import { CheckClaimEligibilitySchema } from '@/lib/validations/claimSchema';
import { claimService } from '@/lib/services/claimService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CheckClaimEligibilitySchema.parse(body);

    const result = await claimService.checkEligibility(validated);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API] /api/v1/claims/check-eligibility error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.errors?.[0]?.message || error.message || 'Failed to check claim eligibility',
      },
      { status: 400 }
    );
  }
}
