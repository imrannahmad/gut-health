import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const websiteFont = localFont({
  src: "./fonts/website-font.otf",
  variable: "--font-website",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gutglow.com"),
  title: "GutGlow — Thoughtful Gut Wellness",
  description:
    "Thoughtful gut wellness for a healthier approach to everyday living. Premium minimalist digestive care.",
  keywords: [
    "gut health",
    "gut wellness",
    "digestive wellness",
    "GutGlow",
    "minimalist wellness",
  ],
  openGraph: {
    title: "GutGlow — Thoughtful Gut Wellness",
    description:
      "Thoughtful gut wellness for a healthier approach to everyday living.",
    url: "https://gutglow.com",
    siteName: "GutGlow",
    images: [
      {
        url: "/images/gutglow-logo.png",
        width: 1200,
        height: 630,
        alt: "GutGlow",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${websiteFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFFFFF] text-[#111111]">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
