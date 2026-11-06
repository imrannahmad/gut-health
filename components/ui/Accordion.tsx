"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function Accordion({
  items,
  defaultOpenId,
}: {
  items: AccordionItem[];
  defaultOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y divide-[#E6E1D3] border-y border-[#E6E1D3]">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="py-4">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between text-left focus:outline-none group"
              aria-expanded={isOpen}
            >
              <span className="text-base font-serif text-[#173D32] group-hover:text-[#0E2921] transition-colors pr-4">
                {item.title}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-[#575D52] group-hover:text-[#173D32] shrink-0"
              >
                <ChevronDown className="w-5 h-5 stroke-[1.5]" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 pb-2 text-sm text-[#575D52] leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
