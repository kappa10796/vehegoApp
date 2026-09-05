import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vehego.com"),
  title: {
    default: "VEHEGO – Premium Cabs for Darjeeling, North Bengal, Dooars, Jungle Safari, Gangtok & Sikkim",
    template: "%s | VEHEGO",
  },
  description:
    "Book premium cabs for Darjeeling, Gangtok, Sikkim & North Bengal with VEHEGO. Reliable airport transfers, outstation cabs and sightseeing with verified drivers and transparent fares.",
  keywords: [
    "VEHEGO",
    "Darjeeling cab booking",
    "Gangtok taxi service",
    "Dooars cab booking",
    "Jungle safari cab booking",
    "North Bengal cab service",
    "Sikkim outstation cabs",
    "Bagdogra airport taxi",
    "NJP to Gangtok cab fare",
    "Custom tour Himalayan cabs",
    "Siliguri to Darjeeling taxi",
  ],
  authors: [{ name: "VEHEGO Team", url: "https://vehego.com" }],
  creator: "VEHEGO",
  publisher: "VEHEGO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VEHEGO – Premium Cabs for Darjeeling, North Bengal, Dooars, Jungle Safari, Gangtok & Sikkim",
    description:
      "Book premium cabs for Darjeeling, Gangtok, Sikkim & North Bengal with VEHEGO. Reliable airport transfers, outstation cabs and sightseeing with verified drivers and transparent fares.",
    url: "https://vehego.com",
    siteName: "VEHEGO",
    images: [
      {
        url: "https://vehego.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "VEHEGO - Premium Cabs & Custom Himalayan Tours",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VEHEGO – Premium Cabs for Darjeeling, North Bengal, Dooars, Jungle Safari, Gangtok & Sikkim",
    description:
      "Book premium cabs for Darjeeling, Gangtok, Sikkim & North Bengal with VEHEGO. Reliable airport transfers, outstation cabs and transparent fares.",
    images: ["https://vehego.com/og-image.png"],
    creator: "@vehego",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VEHEGO",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#E34234",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-50`}
    >
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
