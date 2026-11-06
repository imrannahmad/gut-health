"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Clock, MapPin, Send, CheckCircle, ShieldCheck } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { contactSchema, ContactFormValues } from "@/lib/validations";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Simulate API dispatch
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6EF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#173D32]">
              DIRECT COMMUNICATION
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif text-[#173D32]">
              Connect With GutGlow
            </h1>
            <p className="text-sm sm:text-base text-[#575D52] leading-relaxed">
              Whether you have questions regarding our formulation status, your
              order delivery, or partnership inquiries, our team is here to assist
              you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Information Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#EEEBDD]/50 border border-[#E6E1D3] rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-serif text-[#173D32]">
                  Wellness Concierge
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F8F6EF] border border-[#E6E1D3] flex items-center justify-center text-[#173D32] shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#173D32] block">
                        Email Support
                      </span>
                      <a
                        href="mailto:support@gutglow.com"
                        className="text-[#575D52] hover:text-[#173D32] transition-colors"
                      >
                        care@gutglow.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F8F6EF] border border-[#E6E1D3] flex items-center justify-center text-[#173D32] shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#173D32] block">
                        Hours of Operation
                      </span>
                      <span className="text-[#575D52]">
                        Monday – Friday: 9:30 AM – 6:30 PM IST
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F8F6EF] border border-[#E6E1D3] flex items-center justify-center text-[#173D32] shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#173D32] block">
                        Offices
                      </span>
                      <span className="text-[#575D52]">
                        Mumbai & Bengaluru, India
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6E1D3] text-[11px] text-[#575D52] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7D9273]" />
                  <span>Prompt responses typically delivered within 24 business hours.</span>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-[#EEEBDD]/40 border border-[#E6E1D3] rounded-3xl p-8 sm:p-10">
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[#173D32] text-[#F8F6EF] flex items-center justify-center mx-auto">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-serif text-[#173D32]">
                      Message Received
                    </h3>
                    <p className="text-xs text-[#575D52] max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting us. A dedicated member of our wellness
                      team will review your note and respond shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-xs uppercase tracking-wider font-semibold text-[#173D32] underline hover:text-[#0E2921] pt-2"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <h3 className="text-xl font-serif text-[#173D32] mb-2">
                      Send an Inquiry
                    </h3>

                    <div>
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        {...register("name")}
                        placeholder="Aditi Verma"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-4 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.name && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="aditi@example.com"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-4 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        {...register("subject")}
                        placeholder="Question regarding daily morning ritual"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-4 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#252923] mb-1">
                        Your Message *
                      </label>
                      <textarea
                        rows={4}
                        {...register("message")}
                        placeholder="How can we assist you with GutGlow?"
                        className="w-full bg-[#F8F6EF] border border-[#E6E1D3] rounded-xl px-4 py-2.5 text-xs text-[#252923] focus:outline-none focus:border-[#173D32]"
                      />
                      {errors.message && (
                        <p className="text-[11px] text-[#c0392b] mt-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#173D32] text-[#F8F6EF] py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#122e26] transition-colors shadow disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
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
