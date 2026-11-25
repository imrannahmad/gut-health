'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  RotateCcw,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Loader2,
} from 'lucide-react';

interface AdminSession {
  uid: string;
  email?: string;
  name?: string;
  role: string;
}

interface AdminShellProps {
  adminSession: AdminSession;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dividerBefore?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders & COD', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/customers', label: 'Customers CRM', icon: Users },
  { href: '/admin/inventory', label: 'Batches & Stock', icon: Layers },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag, dividerBefore: true },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/returns', label: 'Returns & Claims', icon: RotateCcw },
];

export function AdminShell({ adminSession, children }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Refined user profile presentation
  const adminEmail = adminSession.email || 'imrannahmd@gmail.com';
  const displayName = adminSession.name || (adminEmail.toLowerCase().includes('imran') ? 'Imran Ahmad' : adminEmail.split('@')[0]);
  const initials = displayName.slice(0, 2).toUpperCase() || 'AD';

  const handleLogout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('[Admin Logout] Error:', err);
    } finally {
      router.push('/admin/login');
      router.refresh();
    }
  };

  const isCurrent = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="admin-portal min-h-screen bg-[#FDFBF7] text-[#2D2A26] flex flex-col md:flex-row antialiased">
      {/* =====================================================================
          MOBILE TOP NAVBAR (Visible only on < md screens)
          ===================================================================== */}
      <div className="md:hidden sticky top-0 z-40 bg-[#210D15] text-[#FAF8F5] border-b border-[#3D1D28] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md text-[#E8C5A5] hover:bg-[#321721] transition focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <span className="font-bold text-base tracking-wider text-[#FDFBF7]">GUTGLOW</span>
            <span className="block text-[8px] tracking-widest text-[#E8C5A5] uppercase font-mono leading-none">
              OPS PORTAL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" title="Cloud Firestore Connected" />
          <Link
            href="/"
            target="_blank"
            className="text-[10px] text-[#C5BDB5] hover:text-[#FFFFFF] flex items-center gap-1 border border-[#3D1D28] px-2 py-1 rounded"
          >
            <span>Store</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>

      {/* =====================================================================
          MOBILE SLIDE-OVER DRAWER MENU (< md screens)
          ===================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#210D15]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-[#210D15] text-[#FAF8F5] flex flex-col h-full shadow-2xl z-10 border-r border-[#3D1D28]">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#3D1D28] flex items-center justify-between">
              <div>
                <span className="text-xl tracking-wider font-bold text-[#FDFBF7]">
                  GUTGLOW
                </span>
                <span className="block text-[9px] tracking-widest text-[#E8C5A5] uppercase font-mono mt-0.5">
                  Management Console
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-[#C5BDB5] hover:text-[#FFFFFF] hover:bg-[#321721] transition"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs font-sans">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isCurrent(item.href);

                return (
                  <React.Fragment key={item.href}>
                    {item.dividerBefore && (
                      <div className="my-2 border-t border-[#3D1D28]/60" />
                    )}
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition ${
                        active
                          ? 'bg-[#321721] text-[#E8C5A5] shadow-xs'
                          : 'text-[#DDD6CF] hover:bg-[#321721]/60 hover:text-[#FFFFFF]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </React.Fragment>
                );
              })}
            </nav>

            {/* User Info & Quick Action Footer */}
            <div className="p-3.5 border-t border-[#3D1D28] space-y-2.5 bg-[#17080E]">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-[#210D15] border border-[#3D1D28]/60">
                <div className="w-8 h-8 rounded-full bg-[#321721] border border-[#E8C5A5]/30 text-[#E8C5A5] flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#FAF8F5] truncate text-xs">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-[#A89F95] truncate mt-0.5">
                    {adminEmail}
                  </p>
                </div>
              </div>

              {/* Quick Actions: Settings & Sign Out */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <Link
                  href="/admin/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-[#210D15] hover:bg-[#2D121D] border border-[#3D1D28] text-[#DDD6CF] hover:text-[#FAF8F5] transition text-xs font-medium"
                >
                  <Settings className="w-3.5 h-3.5 text-[#E8C5A5]" />
                  <span>Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleLogout()}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-[#210D15] hover:bg-[#2D121D] border border-[#3D1D28] text-[#E08A8A] hover:text-[#FFB4B4] transition text-xs font-medium disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>{isLoggingOut ? 'Exiting...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DESKTOP SIDEBAR (Visible only on md: screens and above)
          ===================================================================== */}
      <aside className="hidden md:flex md:w-64 bg-[#210D15] text-[#FAF8F5] flex-col shrink-0 md:fixed md:inset-y-0 md:left-0 z-30 border-r border-[#3D1D28]">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#3D1D28]">
          <Link href="/admin" className="block">
            <span className="text-2xl tracking-wider font-bold text-[#FDFBF7]">
              GUTGLOW
            </span>
            <span className="block text-[10px] tracking-widest text-[#E8C5A5] uppercase font-mono mt-1">
              Management Portal
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 text-xs font-sans overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(item.href);

            return (
              <React.Fragment key={item.href}>
                {item.dividerBefore && (
                  <div className="my-2.5 border-t border-[#3D1D28]/60" />
                )}
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition ${
                    active
                      ? 'bg-[#321721] text-[#E8C5A5] shadow-xs'
                      : 'text-[#DDD6CF] hover:bg-[#321721]/60 hover:text-[#FFFFFF]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* User Info & Quick Action Footer */}
        <div className="p-3.5 border-t border-[#3D1D28] space-y-2.5 bg-[#17080E]">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#210D15] border border-[#3D1D28]/60">
            <div className="w-8 h-8 rounded-full bg-[#321721] border border-[#E8C5A5]/30 text-[#E8C5A5] flex items-center justify-center text-xs font-semibold shrink-0 shadow-inner">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#FAF8F5] truncate text-xs">
                {displayName}
              </p>
              <p className="text-[10px] text-[#A89F95] truncate mt-0.5">
                {adminEmail}
              </p>
            </div>
          </div>

          {/* Quick Actions: Settings & Sign Out */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Link
              href="/admin/settings"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-[#210D15] hover:bg-[#2D121D] border border-[#3D1D28] text-[#DDD6CF] hover:text-[#FAF8F5] transition text-xs font-medium"
            >
              <Settings className="w-3.5 h-3.5 text-[#E8C5A5]" />
              <span>Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => handleLogout()}
              disabled={isLoggingOut}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-[#210D15] hover:bg-[#2D121D] border border-[#3D1D28] text-[#E08A8A] hover:text-[#FFB4B4] transition text-xs font-medium disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>{isLoggingOut ? 'Exiting...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          MAIN CONTENT AREA (Offset by md:pl-64 on desktop)
          ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-[#FFFFFF] border-b border-[#ECE6DE] items-center justify-between px-6 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#857B72] bg-[#F5F0E9] px-2.5 py-1 rounded border border-[#E8E2D9]">
              GUTGLOW OPS v2.3.1
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#6B6158]">
            <span className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#ECE6DE]">
              <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
              <span>Cloud Firestore Connected (asia-south1)</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
