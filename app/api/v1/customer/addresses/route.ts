import { NextResponse } from 'next/server';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';
import { customerService } from '@/lib/services/customerService';

export async function GET(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await customerService.listAddresses(auth.uid);
    return NextResponse.json({ success: true, data: addresses });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/customer/addresses GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const address = await customerService.addAddress(auth.uid, body);

    return NextResponse.json({ success: true, data: address }, { status: 201 });
  } catch (error) {
    console.error('[API] /api/v1/customer/addresses POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save address' },
      { status: 400 }
    );
  }
}
