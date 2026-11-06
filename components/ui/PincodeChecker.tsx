"use client";

import React, { useState } from "react";
import { Check, Truck, AlertCircle, ArrowRight } from "lucide-react";

export function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(clean)) {
      setStatus("error");
      setMessage("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setStatus("checking");
    setTimeout(() => {
      setStatus("success");
      // Calculate realistic delivery date (3 days from now)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const formatted = deliveryDate.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      setMessage(`Standard Delivery by ${formatted} · Free Express Shipping`);
    }, 400);
  };

  return (
    <div className="border border-[#E6E1D3] rounded-xl p-4 bg-[#EEEBDD]/40">
      <div className="flex items-center gap-2 text-xs font-medium text-[#173D32] mb-2">
        <Truck className="w-4 h-4 text-[#7D9273]" />
        <span>Estimated Delivery Check</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ""));
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="Enter 6-digit PIN code"
          className="flex-1 bg-[#F8F6EF] border border-[#E6E1D3] rounded-lg px-3 py-2 text-xs text-[#252923] placeholder-[#575D52]/60 focus:outline-none focus:border-[#173D32]"
        />
        <button
          type="submit"
          disabled={status === "checking"}
          className="bg-[#173D32] text-[#F8F6EF] hover:bg-[#122e26] text-xs px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {status === "checking" ? "Checking..." : "Verify"}
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      {status === "success" && (
        <div className="flex items-center gap-2 mt-2.5 text-xs text-[#173D32]">
          <Check className="w-3.5 h-3.5 text-[#173D32] shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 mt-2.5 text-xs text-[#c0392b]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
