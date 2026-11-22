'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#ECE6DE]">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#210D15] font-semibold tracking-tight">
            Store Settings & Statutory Metadata
          </h1>
          <p className="text-xs text-[#70675E] mt-1">
            Store configurations, GST rates, FSSAI compliance, and operational flags.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compliance Card */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#210D15] font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#15803D]" />
            <span>FSSAI & Regulatory Standards</span>
          </div>
          <p className="text-xs text-[#70675E] leading-relaxed">
            All formulations are compliant under Indian nutraceutical food safety guidelines. HSN Code: <strong>2106 90 99</strong> with 18% inclusive GST standard.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-[#15803D]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Statutory Verification Active</span>
          </div>
        </div>

        {/* Database & Cloud Region */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#210D15] font-semibold text-sm">
            <Database className="w-4 h-4 text-[#2563EB]" />
            <span>Cloud Infrastructure</span>
          </div>
          <p className="text-xs text-[#70675E] leading-relaxed">
            Firebase Project: <strong>gutglow-development</strong> deployed in Mumbai, India (<strong>asia-south1</strong>) with strict deny-by-default security rules.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-[#15803D]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>asia-south1 Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
