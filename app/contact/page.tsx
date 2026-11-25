"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle, Mail, Phone, MapPin, Clock, Globe, Loader2, AlertCircle } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { contactSchema, ContactFormValues } from "@/lib/validations";

interface StoreContactInfo {
  supportEmail: string;
  supportPhone: string;
  instagramUrl: string;
  warehouseAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  hours: string;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [contactInfo, setContactInfo] = useState<StoreContactInfo>({
    supportEmail: "care@gutglow.com",
    supportPhone: "+91 7292929137",
    instagramUrl: "https://instagram.com/gutglowofficial",
    warehouseAddress: {
      line1: "Plot 42, Logistics Park, Bhiwandi",
      city: "Thane",
      state: "Maharashtra",
      pincode: "421302",
      country: "India",
    },
    hours: "Mon–Fri, 9:30 AM – 6:30 PM IST",
  });

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const res = await fetch("/api/v1/contact");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setContactInfo(json.data);
          }
        }
      } catch (err) {
        console.warn("[ContactPage] Using default store contact details:", err);
      }
    }
    fetchContactInfo();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit inquiry. Please try again.");
      }

      setSubmitted(true);
      reset();
    } catch (err) {
      console.error("[Contact Form] Submit error:", err);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedAddress = [
    contactInfo.warehouseAddress.line1,
    contactInfo.warehouseAddress.city,
    contactInfo.warehouseAddress.state,
    contactInfo.warehouseAddress.pincode,
    contactInfo.warehouseAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

  const cleanPhoneForWhatsApp = contactInfo.supportPhone.replace(/[^0-9]/g, "");

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
              COMMUNICATION & CONCIERGE
            </span>
            <h1 className="text-4xl font-bold text-[#111111] tracking-tight">
              Contact Us.
            </h1>
            <p className="text-xs sm:text-sm text-[#666666]">
              Questions regarding formulations, order dispatches, or wholesale partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Info Sidebar */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#F9F8F6] border border-[#E5E0D8] rounded-xl p-6 space-y-5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-[#210D15]" />
                    Customer Support Email
                  </span>
                  <a
                    href={`mailto:${contactInfo.supportEmail}`}
                    className="text-sm font-semibold text-[#111111] hover:text-[#B85D19] transition break-all"
                  >
                    {contactInfo.supportEmail}
                  </a>
                  <p className="text-[11px] text-[#70675E] mt-0.5">Direct ticket routing to wellness experts</p>
                </div>

                <div className="pt-2 border-t border-[#EAE5DE]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-[#210D15]" />
                    Phone / WhatsApp Concierge
                  </span>
                  <a
                    href={`https://wa.me/${cleanPhoneForWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#111111] hover:text-[#B85D19] transition block font-mono"
                  >
                    {contactInfo.supportPhone}
                  </a>
                  <p className="text-[11px] text-[#70675E] mt-0.5">Quick order assistance & priority callbacks</p>
                </div>

                <div className="pt-2 border-t border-[#EAE5DE]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#210D15]" />
                    Operating Support Window
                  </span>
                  <p className="font-medium text-[#111111]">{contactInfo.hours}</p>
                </div>

                <div className="pt-2 border-t border-[#EAE5DE]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#210D15]" />
                    Primary Warehouse & Dispatch Hub
                  </span>
                  <p className="text-[#524B43] leading-relaxed text-[11px]">
                    {formattedAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-7">
              <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-xl p-6 sm:p-8 shadow-xs">
                {submitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#210D15] text-[#FAF8F5] flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle className="w-6 h-6 text-[#E8C5A5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-[#111111]">Inquiry Received</h3>
                      <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
                        Thank you for reaching out. Your query has been logged into our support console. A wellness concierge will respond within 24 hours.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-xs uppercase tracking-wider font-semibold text-[#210D15] underline pt-2 hover:text-[#B85D19] transition"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {submitError && (
                      <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#B91C1C] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          {...register("name")}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                        />
                        {errors.name && (
                          <p className="text-[11px] text-[#c0392b] mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1">
                          Phone / WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          {...register("phone")}
                          placeholder="+91 98765 43210"
                          className="w-full bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition font-mono"
                        />
                        {errors.phone && (
                          <p className="text-[11px] text-[#c0392b] mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="your@email.com"
                        className="w-full bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Subject / Topic *
                      </label>
                      <input
                        type="text"
                        {...register("subject")}
                        placeholder="e.g. Order Tracking, Batch Inquiry, Dietary Question"
                        className="w-full bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Message / Query Details *
                      </label>
                      <textarea
                        rows={4}
                        {...register("message")}
                        placeholder="Please describe your question or order details..."
                        className="w-full bg-[#FAF8F5] border border-[#D5CCC1] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#210D15] focus:bg-[#FFFFFF] transition"
                      />
                      {errors.message && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#210D15] text-[#FAF8F5] py-3 rounded-lg text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#321721] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E8C5A5]" />
                          <span>Submitting Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#E8C5A5]" />
                          <span>Submit Inquiry</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
