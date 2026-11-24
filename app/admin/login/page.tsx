'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSession = async (idToken: string) => {
    const res = await fetch('/api/v1/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Access denied. Account is not authorized for admin operations.');
    }

    const data = await res.json();
    if (!data.user?.role) {
      throw new Error('Access denied. No active administrative role assigned.');
    }

    router.push('/admin');
    router.refresh();
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await userCredential.user.getIdToken();
      await handleCreateSession(idToken);
    } catch (err: unknown) {
      console.error('[Admin Login Security Notice]:', err);
      // Security: Prevent username/email enumeration by giving a generic credential error
      const rawMsg = err instanceof Error ? err.message : '';
      if (rawMsg.includes('not authorized') || rawMsg.includes('Access denied')) {
        setErrorMsg('Access denied: Account does not possess administrative privileges.');
      } else {
        setErrorMsg('Invalid administrative credentials or unauthorized session.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="admin-portal min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-4 py-12 text-[#2D2A26]">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#ECE6DE] rounded-xl shadow-lg p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#210D15] text-[#FAF8F5] mb-2 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#E8C5A5]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#210D15] tracking-tight">
            GUTGLOW
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#857B72]">
            Restricted Management Console
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#FDF2F2] border border-[#F8D7DA] rounded-lg text-xs text-[#9B1C1C] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#524B43] mb-1.5">
              Authorized Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A89F95] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="admin@organization.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-sans normal-case"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#524B43] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A89F95] absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-sans normal-case"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#A89F95] hover:text-[#210D15] transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#210D15] hover:bg-[#321721] text-[#FAF8F5] text-xs font-medium rounded-lg transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            href="/"
            className="text-xs text-[#857B72] hover:text-[#210D15] underline transition"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
