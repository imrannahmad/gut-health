import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
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
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FFFFFF] text-[#111111]">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
