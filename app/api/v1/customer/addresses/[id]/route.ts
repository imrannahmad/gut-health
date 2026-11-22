import { NextResponse } from 'next/server';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';
import { customerService } from '@/lib/services/customerService';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await request.json();

    await customerService.updateAddress(auth.uid, id, body);
    return NextResponse.json({ success: true, message: 'Address updated successfully' });
  } catch (error) {
    console.error('[API] /api/v1/customer/addresses/[id] PUT error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update address' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    await customerService.deleteAddress(auth.uid, id);

    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('[API] /api/v1/customer/addresses/[id] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete address' },
      { status: 400 }
    );
  }
}
