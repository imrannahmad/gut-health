import { NextResponse } from 'next/server';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';
import { customerService } from '@/lib/services/customerService';

export async function GET(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await customerService.getCustomerProfile(auth.uid);
    if (!profile) {
      // Auto-provision if document doesn't exist yet
      const user = await customerService.ensureCustomerUserDoc(auth.uid, auth.email, auth.name);
      return NextResponse.json({ success: true, data: { user, addresses: [] } });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    if ((error as any)?.digest) {
      throw error;
    }
    console.error('[API] /api/v1/customer/profile GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await customerService.updateCustomerProfile(auth.uid, body);

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('[API] /api/v1/customer/profile PUT error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Update failed' },
      { status: 400 }
    );
  }
}
