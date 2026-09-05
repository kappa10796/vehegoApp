import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Tour Requests & Bids Marketplace | VEHEGO",
  description:
    "Browse customer custom multi-day tour itineraries for Darjeeling, Sikkim, and Gangtok. Compare transparent price quotes submitted directly by verified local drivers.",
  alternates: {
    canonical: "/custom-tours",
  },
  openGraph: {
    title: "Custom Tour Requests & Bids Marketplace | VEHEGO",
    description:
      "Browse custom multi-day Himalayan itineraries and compare live driver price quotes with transparent fare breakdowns.",
    url: "https://vehego.com/custom-tours",
    siteName: "VEHEGO",
    images: [
      {
        url: "https://vehego.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "VEHEGO Custom Tours & Driver Quotes",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Tour Requests & Bids Marketplace | VEHEGO",
    description:
      "Browse custom multi-day Himalayan itineraries and compare live driver price quotes.",
    images: ["https://vehego.com/og-image.png"],
  },
};

export default function CustomToursLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
