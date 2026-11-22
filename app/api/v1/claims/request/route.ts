import { NextResponse } from 'next/server';
import { CreateClaimInputSchema } from '@/lib/validations/claimSchema';
import { claimService } from '@/lib/services/claimService';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CreateClaimInputSchema.parse(body);

    const customerSession = await verifyCustomerAuth(request);
    const actorUid = customerSession?.uid;

    const claim = await claimService.createClaim(validated, actorUid);

    return NextResponse.json(
      {
        success: true,
        data: claim,
        message: 'Transit damage claim submitted successfully. Our quality team will inspect the evidence within 24 business hours.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] /api/v1/claims/request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.errors?.[0]?.message || error.message || 'Failed to submit claim',
      },
      { status: 400 }
    );
  }
}
