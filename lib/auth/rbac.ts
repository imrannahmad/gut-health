import { adminAuth, adminDb } from '@/lib/firebase/admin';
import type { AdminRole } from '@/types/firestore';

export type AdminPermission =
  | 'products:read'
  | 'products:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'orders:read'
  | 'orders:write'
  | 'returns:read'
  | 'returns:write'
  | 'coupons:manage'
  | 'settings:read'
  | 'settings:write'
  | 'admins:manage';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'products:read',
    'products:write',
    'inventory:read',
    'inventory:write',
    'orders:read',
    'orders:write',
    'returns:read',
    'returns:write',
    'coupons:manage',
    'settings:read',
    'settings:write',
    'admins:manage',
  ],
  order_manager: [
    'orders:read',
    'orders:write',
    'inventory:read',
    'returns:read',
    'returns:write',
    'products:read',
  ],
  product_manager: [
    'products:read',
    'products:write',
    'inventory:read',
    'inventory:write',
    'coupons:manage',
  ],
  support_manager: [
    'orders:read',
    'returns:read',
    'returns:write',
    'products:read',
  ],
};

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export interface AdminSessionClaims {
  uid: string;
  email?: string;
  role: AdminRole;
}

export const ADMIN_COOKIE_NAME = 'gutglow_admin_session';

/**
 * Verifies the admin session cookie and returns decoded user claims
 */
export async function verifyAdminSession(
  sessionCookie?: string
): Promise<AdminSessionClaims | null> {
  if (!sessionCookie) return null;

  try {
    // checkRevoked: true checks if user tokens/sessions were revoked
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    const role = (decodedClaims.role as AdminRole) || null;
    if (!role) {
      // Fallback: Check admins collection in Firestore if claim not synced to token yet
      const adminDoc = await adminDb.collection('admins').doc(decodedClaims.uid).get();
      if (!adminDoc.exists || !adminDoc.data()?.isActive) {
        return null;
      }
      return {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: adminDoc.data()?.role as AdminRole,
      };
    }

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role,
    };
  } catch (error) {
    console.warn('[RBAC] Admin session verification failed:', error);
    return null;
  }
}
