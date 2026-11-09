"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle } from "lucide-react";
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
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSubmitted(true);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666666]">
              COMMUNICATION
            </span>
            <h1 className="text-4xl font-bold text-[#111111]">
              Contact Us.
            </h1>
            <p className="text-xs sm:text-sm text-[#666666]">
              Questions regarding orders or product details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Info */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-xl p-6 space-y-4 text-xs">
                <div>
                  <span className="font-bold text-[#111111] block mb-0.5">Email</span>
                  <a href="mailto:care@gutglow.com" className="text-[#666666] hover:text-[#111111]">
                    care@gutglow.com
                  </a>
                </div>
                <div>
                  <span className="font-bold text-[#111111] block mb-0.5">Hours</span>
                  <p className="text-[#666666]">Mon–Fri, 9:30 AM – 6:30 PM IST</p>
                </div>
                <div>
                  <span className="font-bold text-[#111111] block mb-0.5">Locations</span>
                  <p className="text-[#666666]">Mumbai & Bengaluru, India</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-7">
              <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 sm:p-8">
                {submitted ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[#111111] text-[#FFFFFF] flex items-center justify-center mx-auto">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111111]">Message Sent</h3>
                    <p className="text-xs text-[#666666]">We will respond within 24 hours.</p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-xs uppercase tracking-wider font-semibold text-[#111111] underline pt-2"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        {...register("name")}
                        placeholder="Your name"
                        className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.name && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="your@email.com"
                        className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        {...register("subject")}
                        placeholder="Topic"
                        className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Message *
                      </label>
                      <textarea
                        rows={3}
                        {...register("message")}
                        placeholder="Your message"
                        className="w-full bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      />
                      {errors.message && (
                        <p className="text-[11px] text-[#c0392b] mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#111111] text-[#FFFFFF] py-3 rounded-lg text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#333333] transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? "Sending..." : "Submit"}</span>
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
