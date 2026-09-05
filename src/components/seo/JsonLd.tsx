import React from 'react'

export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    'name': 'VEHEGO',
    'alternateName': 'VEHEGO Cabs & Tours',
    'url': 'https://vehego.com',
    'logo': 'https://vehego.com/og-image.png',
    'image': 'https://vehego.com/og-image.png',
    'description': 'Book premium cabs for Darjeeling, Gangtok, Sikkim, Dooars, Jungle Safari & North Bengal with VEHEGO. Reliable airport transfers, outstation cabs and sightseeing with verified drivers and transparent fares.',
    'telephone': '+91-9800000000',
    'priceRange': '₹₹',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Siliguri',
      'addressRegion': 'West Bengal',
      'addressCountry': 'IN',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 26.7271,
      'longitude': 88.3953,
    },
    'areaServed': [
      'Darjeeling',
      'Gangtok',
      'Sikkim',
      'Dooars',
      'Jungle Safari',
      'Kalimpong',
      'Pelling',
      'Lachen',
      'Lachung',
      'Siliguri',
      'Bagdogra Airport',
      'NJP Railway Station',
    ],
    'sameAs': [
      'https://facebook.com/vehego',
      'https://instagram.com/vehego',
      'https://twitter.com/vehego',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'VEHEGO',
    'url': 'https://vehego.com',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://vehego.com/cabs/search?pickup={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}
