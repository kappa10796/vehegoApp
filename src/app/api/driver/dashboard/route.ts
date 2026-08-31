import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = auth.user.id

    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        vehicles: true
      }
    })

    if (!driver) {
      return NextResponse.json({ driver: null })
    }

    // Get bookings assigned to driver or pending in area
    const assignedBookings = await prisma.booking.findMany({
      where: { driverId: driver.id },
      include: {
        customer: { select: { name: true, phone: true } },
        route: true,
        vehicle: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const completedTrips = assignedBookings.filter(b => b.status === 'COMPLETED')
    const totalEarnings = completedTrips.reduce((sum, b) => sum + b.totalFare * 0.85, 0) // 85% driver share

    const upcomingTrips = assignedBookings.filter(b =>
      ['CONFIRMED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'TRIP_STARTED'].includes(b.status)
    )

    return NextResponse.json({
      driver,
      stats: {
        totalTrips: completedTrips.length,
        totalEarnings,
        upcomingCount: upcomingTrips.length,
        rating: 4.9
      },
      assignedBookings,
      upcomingTrips
    })
  } catch (error) {
    console.error('Error fetching driver dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
