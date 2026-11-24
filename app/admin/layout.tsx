import React from 'react';
import { cookies } from 'next/headers';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
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

  return (
    <AdminShell
      adminSession={{
        uid: adminSession.uid,
        email: adminSession.email || 'imrannahmd@gmail.com',
        role: adminSession.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
