import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingId: id }] },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        route: true,
        vehicle: true,
        payment: true
      }
    })

    if (!booking) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching driver trip:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { status } = await req.json()

    const validStatuses = ['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'TRIP_STARTED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid trip status' }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id }, { bookingId: id }] }
    })

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status,
        ...(status === 'COMPLETED' ? { paymentStatus: 'PAID' } : {})
      }
    })

    if (status === 'COMPLETED') {
      await prisma.payment.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'SUCCESS' }
      }).catch(() => {})
    }

    // If trip completed or cancelled, set driver availability back to AVAILABLE
    if (['COMPLETED', 'CANCELLED'].includes(status) && booking.driverId) {
      await prisma.driver.update({
        where: { id: booking.driverId },
        data: { availability: 'AVAILABLE' }
      }).catch(() => {})
    } else if (['DRIVER_ARRIVING', 'TRIP_STARTED'].includes(status) && booking.driverId) {
      await prisma.driver.update({
        where: { id: booking.driverId },
        data: { availability: 'ON_TRIP' }
      }).catch(() => {})
    }

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('Error updating trip status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
