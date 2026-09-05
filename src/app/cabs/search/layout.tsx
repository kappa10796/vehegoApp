import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search & Book Outstation Cabs | VEHEGO",
  description:
    "Find and book reliable cabs for Darjeeling, Gangtok, Kalimpong, Bagdogra Airport & Siliguri. Fixed transparent pricing, instant booking, and verified local drivers.",
  alternates: {
    canonical: "/cabs/search",
  },
  openGraph: {
    title: "Search & Book Outstation Cabs | VEHEGO",
    description:
      "Find and book reliable cabs for Darjeeling, Gangtok, Kalimpong, Bagdogra Airport & Siliguri.",
    url: "https://vehego.com/cabs/search",
    siteName: "VEHEGO",
    images: [
      {
        url: "https://vehego.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "VEHEGO Cab Booking",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
