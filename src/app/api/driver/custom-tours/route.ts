import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'himalayan-ride-super-secret-key-2026'
const key = new TextEncoder().encode(secretKey)

async function getSessionFromReq(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) return null
  try {
    const { payload } = await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] })
    return payload?.user as { id: string; email: string; role: string; name: string } | null
  } catch {
    return null
  }
}

// GET /api/driver/custom-tours -> Open custom tour requests for driver marketplace
export async function GET(request: NextRequest) {
  const user = await getSessionFromReq(request)
  if (!user || (user.role !== 'DRIVER' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized. Driver access required.' }, { status: 401 })
  }

  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: user.id },
      include: { vehicles: true }
    })

    if (!driver || driver.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Driver profile is not approved' }, { status: 403 })
    }

    const openRequests = await prisma.customTourRequest.findMany({
      where: { status: 'OPEN' },
      include: {
        customer: { select: { name: true, phone: true } },
        quotes: {
          where: { driverId: driver.id },
          include: { vehicle: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({
      openRequests,
      driverVehicles: driver.vehicles,
      driverId: driver.id
    })
  } catch (error: any) {
    console.error('Error fetching driver custom tour marketplace:', error)
    return NextResponse.json({ error: 'Failed to fetch custom tour requests' }, { status: 500 })
  }
}
