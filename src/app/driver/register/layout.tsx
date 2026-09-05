import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drive with VEHEGO – Partner Driver Registration",
  description:
    "Join VEHEGO as a partner driver in Darjeeling, Gangtok & Sikkim. Bid on custom multi-day tours, get direct bookings, and earn transparent daily income.",
  alternates: {
    canonical: "/driver/register",
  },
  openGraph: {
    title: "Drive with VEHEGO – Partner Driver Registration",
    description:
      "Join VEHEGO as a partner driver. Bid on custom tour itineraries and receive direct trip bookings.",
    url: "https://vehego.com/driver/register",
    siteName: "VEHEGO",
    images: [
      {
        url: "https://vehego.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "VEHEGO Driver Partner",
      },
    ],
  },
};

export default function DriverRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
