import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gutglow.com"),
  title: "GutGlow | Wellness From Within",
  description:
    "A thoughtful approach to everyday gut wellness. Supporting digestive balance, nutritional harmony, and your well-being from within.",
  keywords: [
    "gut health",
    "gut wellness",
    "digestive wellness",
    "wellness from within",
    "GutGlow",
  ],
  openGraph: {
    title: "GutGlow | Wellness From Within",
    description:
      "A thoughtful approach to everyday gut wellness. Supporting digestive balance, nutritional harmony, and your well-being from within.",
    url: "https://gutglow.com",
    siteName: "GutGlow",
    images: [
      {
        url: "/images/gutglow-logo.png",
        width: 1200,
        height: 630,
        alt: "GutGlow - Wellness From Within",
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
      className={`${playfair.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8F6EF] text-[#252923]">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
