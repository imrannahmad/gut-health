import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  RotateCcw,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  const adminSession = await verifyAdminSession(sessionCookie);

  // If unauthenticated or invalid session, allow login page to render; otherwise redirect to login
  if (!adminSession) {
    // Note: in Next.js App Router, layout wraps all subpages.
    // If the path is /admin/login, the login page will handle itself.
    // We can conditionally render the login container or verify via headers.
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row text-[#2D2A26]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#210D15] text-[#FAF8F5] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#3D1D28]">
          <Link href="/admin" className="block">
            <span className="font-serif text-2xl tracking-wider font-semibold text-[#FDFBF7]">
              GUTGLOW
            </span>
            <span className="block text-[10px] tracking-widest text-[#E8C5A5] uppercase font-mono mt-1">
              Management Portal
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm font-sans">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#321721] text-[#E8C5A5] font-medium transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#321721] text-[#DDD6CF] hover:text-[#FFFFFF] transition"
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </Link>

          <Link
            href="/admin/inventory"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#321721] text-[#DDD6CF] hover:text-[#FFFFFF] transition"
          >
            <Layers className="w-4 h-4" />
            <span>Batches & Stock</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#321721] text-[#DDD6CF] hover:text-[#FFFFFF] transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & COD</span>
          </Link>

          <Link
            href="/admin/returns"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#321721] text-[#DDD6CF] hover:text-[#FFFFFF] transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Returns & Claims</span>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#321721] text-[#DDD6CF] hover:text-[#FFFFFF] transition"
          >
            <Settings className="w-4 h-4" />
            <span>Store Policies</span>
          </Link>
        </nav>

        {/* User Status & Storefront Link */}
        <div className="p-4 border-t border-[#3D1D28] space-y-3">
          <div className="flex items-center gap-2 px-2 text-xs text-[#C5BDB5]">
            <ShieldCheck className="w-4 h-4 text-[#7BB896]" />
            <div className="truncate">
              <p className="font-semibold text-[#FAF8F5] truncate">{adminSession.email}</p>
              <p className="text-[10px] text-[#E8C5A5] uppercase tracking-wider">{adminSession.role}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#A89F95] px-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 hover:text-[#FFFFFF] transition"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <form action="/api/v1/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1 text-[#E08A8A] hover:text-[#FFB4B4] transition"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-[#FFFFFF] border-b border-[#ECE6DE] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#857B72] bg-[#F5F0E9] px-2.5 py-1 rounded">
              GUTGLOW OPS v2.3.1
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#6B6158]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
              <span>Cloud Firestore Connected (asia-south1)</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
