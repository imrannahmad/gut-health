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
      setMessage("Please enter a valid 6-digit PIN code");
      return;
    }

    setStatus("checking");
    setTimeout(() => {
      setStatus("success");
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const formatted = deliveryDate.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      setMessage(`Express Delivery by ${formatted} · Free Shipping`);
    }, 350);
  };

  return (
    <div className="border border-[#E5E5E5] rounded-xl p-4 bg-[#F5F5F5]">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#111111] mb-2">
        <Truck className="w-3.5 h-3.5 text-[#111111]" />
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
          placeholder="Enter 6-digit PIN"
          className="flex-1 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111] placeholder-[#666666] focus:outline-none focus:border-[#111111]"
        />
        <button
          type="submit"
          disabled={status === "checking"}
          className="bg-[#111111] text-[#FFFFFF] hover:bg-[#333333] text-xs px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {status === "checking" ? "Checking..." : "Verify"}
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      {status === "success" && (
        <div className="flex items-center gap-2 mt-2.5 text-xs text-[#111111]">
          <Check className="w-3.5 h-3.5 text-[#111111] shrink-0" />
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
