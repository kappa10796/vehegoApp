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

// POST /api/custom-tours/[id]/accept -> Customer accepts a driver's quote
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionFromReq(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { quoteId } = body

    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
    }

    const tourRequest = await prisma.customTourRequest.findUnique({
      where: { id },
      include: { quotes: true }
    })

    if (!tourRequest) {
      return NextResponse.json({ error: 'Tour request not found' }, { status: 404 })
    }

    if (tourRequest.customerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tour request.' }, { status: 403 })
    }

    const targetQuote = await prisma.customTourQuote.findUnique({
      where: { id: quoteId },
      include: { driver: true, vehicle: true }
    })

    if (!targetQuote || targetQuote.requestId !== id) {
      return NextResponse.json({ error: 'Invalid driver quote selected' }, { status: 400 })
    }

    // Mark quote as ACCEPTED, others as REJECTED
    await prisma.customTourQuote.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' }
    })

    await prisma.customTourQuote.updateMany({
      where: { requestId: id, id: { not: quoteId } },
      data: { status: 'REJECTED' }
    })

    // Mark Custom Tour Request as ACCEPTED
    await prisma.customTourRequest.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    })

    // Create a official Booking record
    const bookingId = `HR-${new Date().getFullYear()}-CT${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    let parsedItinerary = []
    try {
      parsedItinerary = typeof tourRequest.dayItinerary === 'string' ? JSON.parse(tourRequest.dayItinerary) : tourRequest.dayItinerary
    } catch {
      parsedItinerary = [{ day: 1, title: tourRequest.title }]
    }

    const firstDay = parsedItinerary[0]?.title || `Tour from ${tourRequest.startCity}`
    const lastDay = parsedItinerary[parsedItinerary.length - 1]?.title || `${tourRequest.totalDays} Days Custom Tour`

    const fareBreakdown = JSON.stringify([
      { label: `Custom ${tourRequest.totalDays}-Day Itinerary Quote`, amount: targetQuote.quotedPrice },
      { label: 'Platform Fee & Service Tax', amount: 0 }
    ])

    const booking = await prisma.booking.create({
      data: {
        bookingId,
        customerId: user.id,
        driverId: targetQuote.driverId,
        vehicleId: targetQuote.vehicleId,
        tripType: 'CUSTOM_TOUR',
        pickupLocation: tourRequest.startCity,
        dropLocation: `Tour Finish (${lastDay})`,
        pickupTime: '09:00 AM',
        tripDate: tourRequest.startDate,
        passengers: tourRequest.passengers,
        totalFare: targetQuote.quotedPrice,
        fareBreakdown,
        status: 'CONFIRMED',
        paymentStatus: 'PAY_AT_PICKUP',
        specialInstructions: `Custom Tour: ${tourRequest.title}. Driver Notes: ${targetQuote.notes || 'None'}`
      }
    })

    return NextResponse.json({
      success: true,
      booking,
      message: 'Driver quote accepted successfully! Booking confirmed.'
    })
  } catch (error: any) {
    console.error('Error accepting driver quote:', error)
    return NextResponse.json({ error: error?.message || 'Failed to accept quote' }, { status: 500 })
  }
}
