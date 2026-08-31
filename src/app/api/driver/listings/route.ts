import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: auth.user.id }
    })

    if (!driver) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    if (driver.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your driver profile is pending admin approval. You cannot manage listings until approved.', status: driver.status }, { status: 403 })
    }

    const listings = await prisma.driverListing.findMany({
      where: { driverId: driver.id },
      include: {
        vehicle: true
      },
      orderBy: { availableDate: 'asc' }
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Error fetching driver listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: auth.user.id },
      include: { vehicles: true }
    })

    if (!driver) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    if (driver.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your driver profile is pending admin approval. You cannot manage listings until approved.', status: driver.status }, { status: 403 })
    }

    const body = await req.json()
    const {
      type,
      title,
      origin,
      destination,
      itinerary,
      duration,
      customPrice,
      suggestedPrice,
      availableSeats = 4,
      availableDate,
      availableDates, // Optional array of multiple dates e.g. ["2026-08-25", "2026-08-26", "2026-08-27"]
      timeSlotPricing, // Optional 1-hour bandwidth time slot pricing
      notes
    } = body

    if (!type || !title || !customPrice) {
      return NextResponse.json({ error: 'Missing required listing information' }, { status: 400 })
    }

    // Determine list of dates to generate listings for
    let targetDates: string[] = []
    if (Array.isArray(availableDates) && availableDates.length > 0) {
      targetDates = availableDates
    } else if (availableDate) {
      targetDates = [availableDate]
    } else {
      return NextResponse.json({ error: 'Please select at least one available date' }, { status: 400 })
    }

    const vehicle = driver.vehicles[0]
    const timeSlotPricingStr = timeSlotPricing ? (typeof timeSlotPricing === 'string' ? timeSlotPricing : JSON.stringify(timeSlotPricing)) : null

    // Create listing for each selected available date
    const createdListings = await Promise.all(
      targetDates.map(dateStr => 
        prisma.driverListing.create({
          data: {
            driverId: driver.id,
            vehicleId: vehicle?.id || null,
            type,
            title,
            origin: origin || null,
            destination: destination || null,
            itinerary: itinerary ? (typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary)) : null,
            duration: duration || 'Full Day',
            customPrice: Number(customPrice),
            suggestedPrice: Number(suggestedPrice || customPrice),
            timeSlotPricing: timeSlotPricingStr,
            availableSeats: Number(availableSeats),
            availableDate: new Date(dateStr),
            notes,
            status: 'ACTIVE'
          },
          include: {
            vehicle: true
          }
        })
      )
    )

    return NextResponse.json({
      listings: createdListings,
      count: createdListings.length,
      message: `Successfully listed for ${createdListings.length} available date(s)!`
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating driver listings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
