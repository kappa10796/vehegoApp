import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await verifyAuth(req as any)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      routeId,
      vehicleId,
      driverListingId,
      date,
      pickupTime,
      pickupAddress,
      dropAddress,
      passengers = 1,
      totalFare,
      paymentMethod = 'CASH_ON_COMPLETION',
      fareBreakdown,
      specialInstructions
    } = body

    if (!date || !pickupAddress || !totalFare) {
      return NextResponse.json({ error: 'Missing required booking details' }, { status: 400 })
    }

    // Resolve valid vehicleId
    let resolvedVehicleId = vehicleId
    let resolvedDriverId: string | null = null

    if (driverListingId) {
      const listing = await prisma.driverListing.findUnique({
        where: { id: driverListingId },
        include: { vehicle: true }
      })
      if (listing) {
        resolvedDriverId = listing.driverId
        if (listing.vehicleId) resolvedVehicleId = listing.vehicleId
      }
    }

    // Check if resolvedVehicleId exists in DB, otherwise pick first available vehicle
    let targetVehicle = null
    if (resolvedVehicleId && resolvedVehicleId !== 'new') {
      targetVehicle = await prisma.vehicle.findUnique({ where: { id: resolvedVehicleId } })
    }

    if (!targetVehicle) {
      targetVehicle = await prisma.vehicle.findFirst()
    }

    if (!targetVehicle) {
      return NextResponse.json({ error: 'No vehicle registered in system to attach booking' }, { status: 400 })
    }

    const finalDriverId = resolvedDriverId || targetVehicle.driverId || null

    const isCashOnCompletion = paymentMethod === 'CASH_ON_COMPLETION' || paymentMethod === 'PAY_AT_PICKUP' || paymentMethod === 'CASH' || !paymentMethod
    const bookingStatus = 'CONFIRMED' // Confirm booking immediately even if payment is cash on completion
    const paymentStatus = isCashOnCompletion ? 'PENDING' : 'PAID'
    const resolvedPaymentMethod = isCashOnCompletion ? 'CASH_ON_COMPLETION' : paymentMethod

    // Generate custom booking ID
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()
    const bookingId = `HR-${new Date().getFullYear()}-${randomCode}`

    const booking = await prisma.booking.create({
      data: {
        bookingId,
        customer: { connect: { id: session.user.id } },
        driver: finalDriverId ? { connect: { id: finalDriverId } } : undefined,
        vehicle: { connect: { id: targetVehicle.id } },
        driverListing: driverListingId ? { connect: { id: driverListingId } } : undefined,
        route: routeId ? { connect: { id: routeId } } : undefined,
        pickupLocation: pickupAddress,
        dropLocation: dropAddress,
        pickupTime: pickupTime || undefined,
        specialInstructions: specialInstructions || undefined,
        tripDate: new Date(date),
        passengers: parseInt(passengers) || 1,
        tripType: 'ONE_WAY',
        status: bookingStatus,
        paymentStatus: paymentStatus,
        totalFare: Number(totalFare),
        fareBreakdown: fareBreakdown ? (typeof fareBreakdown === 'string' ? fareBreakdown : JSON.stringify(fareBreakdown)) : JSON.stringify({ totalFare: Number(totalFare) }),
        payment: {
          create: {
            amount: Number(totalFare),
            paymentMethod: resolvedPaymentMethod,
            status: paymentStatus === 'PAID' ? 'SUCCESS' : 'PENDING',
          }
        }
      }
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifyAuth(req as any)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role

    let bookings: any[] = []

    if (role === 'ADMIN') {
      bookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        include: { customer: true, driver: { include: { user: true } }, vehicle: true, route: true, payment: true }
      })
    } else if (role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({ where: { userId: session.user.id } })
      if (driver) {
        bookings = await prisma.booking.findMany({
          where: { driverId: driver.id },
          orderBy: { tripDate: 'asc' },
          include: { customer: true, vehicle: true, route: true, payment: true }
        })
      }
    } else {
      bookings = await prisma.booking.findMany({
        where: { customerId: session.user.id },
        orderBy: { tripDate: 'desc' },
        include: { driver: { include: { user: true } }, vehicle: true, route: true, payment: true }
      })
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Fetching bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
