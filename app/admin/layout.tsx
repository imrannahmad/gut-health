import React from 'react';
import { cookies } from 'next/headers';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { adminDb } from '@/lib/firebase/admin';
import { AdminShell } from '@/components/admin/AdminShell';

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  const adminSession = await verifyAdminSession(sessionCookie);

  // If unauthenticated or invalid session, allow login page to render; otherwise redirect in page
  if (!adminSession) {
    return <>{children}</>;
  }

  let adminName: string | undefined;
  try {
    const adminDoc = await adminDb.collection('admins').doc(adminSession.uid).get();
    if (adminDoc.exists && adminDoc.data()?.name) {
      adminName = adminDoc.data()?.name.replace(/\s*\(Owner\)\s*/i, '').trim();
    }
  } catch (err) {
    console.warn('[Admin Layout] Failed to fetch admin name:', err);
  }

  return (
    <AdminShell
      adminSession={{
        uid: adminSession.uid,
        email: adminSession.email || 'super.admin',
        name: adminName,
        role: adminSession.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
