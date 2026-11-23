import { NextResponse } from 'next/server';
import { verifyCustomerAuth } from '@/lib/auth/customerAuth';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await verifyCustomerAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Query orders matching customer email or UID
    const ordersCol = adminDb.collection('orders');
    
    // Query by email
    const emailSnap = await ordersCol
      .where('customer.email', '==', auth.email.toLowerCase())
      .get();

    const ordersMap = new Map<string, any>();

    emailSnap.docs.forEach((doc) => {
      ordersMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Also query by userId if set
    if (auth.uid) {
      const uidSnap = await ordersCol
        .where('customer.userId', '==', auth.uid)
        .get();
      uidSnap.docs.forEach((doc) => {
        ordersMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
    }

    const orders = Array.from(ordersMap.values()).sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('[API] /api/v1/customer/orders GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
