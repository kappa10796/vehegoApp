import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://vehego.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/login',
          '/register',
          '/dashboard',
          '/dashboard/*',
          '/driver/dashboard',
          '/driver/trip/*',
          '/account',
          '/checkout',
          '/payment',
          '/booking-success',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
