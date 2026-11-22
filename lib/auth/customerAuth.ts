import { adminAuth } from '@/lib/firebase/admin';

export interface CustomerAuthPayload {
  uid: string;
  email: string;
  name?: string;
}

export async function verifyCustomerAuth(request: Request): Promise<CustomerAuthPayload | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const idToken = authHeader.split('Bearer ')[1].trim();
    if (!idToken) return null;

    const decoded = await adminAuth.verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || '',
    };
  } catch (error) {
    console.warn('[CustomerAuth] Verification notice:', (error as Error).message);
    return null;
  }
}
