import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'himalayan-ride-super-secret-key-2026'
const key = new TextEncoder().encode(secretKey)

async function getSessionFromReq(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) return null
  try {
    const { payload } = await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] })
    return payload?.user as { id: string; email: string; role: string; name: string; driverStatus?: string } | null
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const user = await getSessionFromReq(request)

  // Rewrite /cabs to /cabs/search to preserve clean browser history stack
  if (url.pathname === '/cabs') {
    url.pathname = '/cabs/search'
    return NextResponse.rewrite(url)
  }

  // Protect Admin Routes
  if (url.pathname.startsWith('/admin')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (user.role !== 'ADMIN') {
      url.pathname = user.role === 'DRIVER' ? '/driver/listings' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Protect Driver Routes
  if (url.pathname.startsWith('/driver')) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (user.role !== 'DRIVER' && user.role !== 'ADMIN') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // If user is DRIVER, redirect root landing page & customer views directly to Driver Custom Rides & Sightseeing page (/driver/listings)
  if (user && user.role === 'DRIVER') {
    const customerPaths = ['/', '/cabs', '/cabs/search', '/sightseeing', '/routes', '/booking', '/dashboard']
    const isCustomerPath = customerPaths.some(p => url.pathname === p || url.pathname.startsWith(`${p}/`))
    if (isCustomerPath && !url.pathname.startsWith('/driver')) {
      url.pathname = '/driver/listings'
      return NextResponse.redirect(url)
    }
  }

  // If user is ADMIN, redirect root landing page to Admin Dashboard
  if (user && user.role === 'ADMIN' && url.pathname === '/') {
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/driver/:path*',
    '/cabs/:path*',
    '/sightseeing',
    '/routes',
    '/booking/:path*',
    '/dashboard/:path*'
  ],
}
