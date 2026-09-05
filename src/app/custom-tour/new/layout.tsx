import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Custom Tour Itinerary Request | VEHEGO",
  description:
    "Build your custom multi-day mountain tour itinerary for Darjeeling, Gangtok, and Sikkim. Get direct competitive price quotes from verified local drivers.",
  alternates: {
    canonical: "/custom-tour/new",
  },
  openGraph: {
    title: "Create Custom Tour Itinerary Request | VEHEGO",
    description:
      "Build your custom multi-day mountain tour itinerary and receive driver quotes.",
    url: "https://vehego.com/custom-tour/new",
    siteName: "VEHEGO",
    images: [
      {
        url: "https://vehego.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Create Custom Tour Request - VEHEGO",
      },
    ],
  },
};

export default function NewCustomTourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
