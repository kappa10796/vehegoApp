import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: id },
          { bookingId: id }
        ]
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        driver: {
          include: {
            user: { select: { name: true, phone: true } }
          }
        },
        vehicle: true,
        driverListing: {
          include: {
            vehicle: true
          }
        },
        route: true,
        payment: true,
        review: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Access control: customer, driver, or admin
    const userId = auth.user.id
    const userRole = auth.user.role

    if (
      userRole !== 'ADMIN' &&
      booking.customerId !== userId &&
      booking.driver?.userId !== userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, pickupTime, pickupLocation, specialInstructions } = body

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: id },
          { bookingId: id }
        ]
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Build update data object
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (pickupTime !== undefined) updateData.pickupTime = pickupTime
    if (pickupLocation !== undefined) updateData.pickupLocation = pickupLocation
    if (specialInstructions !== undefined) updateData.specialInstructions = specialInstructions

    // Customer can cancel if pending or confirmed
    if (status === 'CANCELLED') {
      if (booking.customerId !== auth.user.id && auth.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: updateData
    })

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
