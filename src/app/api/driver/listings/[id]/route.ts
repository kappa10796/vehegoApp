import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const driver = await prisma.driver.findUnique({
      where: { userId: auth.user.id }
    })

    if (!driver) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    if (driver.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your driver profile is pending admin approval. You cannot manage listings until approved.' }, { status: 403 })
    }

    const existingListing = await prisma.driverListing.findUnique({
      where: { id }
    })

    if (!existingListing || existingListing.driverId !== driver.id) {
      return NextResponse.json({ error: 'Listing not found or permission denied' }, { status: 404 })
    }

    const {
      title,
      origin,
      destination,
      itinerary,
      duration,
      customPrice,
      timeSlotPricing,
      availableSeats,
      availableDate,
      notes,
      status
    } = body

    const updatedListing = await prisma.driverListing.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingListing.title,
        origin: origin !== undefined ? origin : existingListing.origin,
        destination: destination !== undefined ? destination : existingListing.destination,
        itinerary: itinerary !== undefined ? (typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary)) : existingListing.itinerary,
        duration: duration !== undefined ? duration : existingListing.duration,
        customPrice: customPrice !== undefined ? Number(customPrice) : existingListing.customPrice,
        timeSlotPricing: timeSlotPricing !== undefined ? (typeof timeSlotPricing === 'string' ? timeSlotPricing : JSON.stringify(timeSlotPricing)) : existingListing.timeSlotPricing,
        availableSeats: availableSeats !== undefined ? Number(availableSeats) : existingListing.availableSeats,
        availableDate: availableDate ? new Date(availableDate) : existingListing.availableDate,
        notes: notes !== undefined ? notes : existingListing.notes,
        status: status !== undefined ? status : existingListing.status
      },
      include: {
        vehicle: true
      }
    })

    return NextResponse.json({ listing: updatedListing, message: 'Listing updated successfully' })
  } catch (error) {
    console.error('Error updating driver listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const driver = await prisma.driver.findUnique({
      where: { userId: auth.user.id }
    })

    if (!driver) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    if (driver.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your driver profile is pending admin approval. You cannot manage listings until approved.' }, { status: 403 })
    }

    const listing = await prisma.driverListing.findUnique({
      where: { id }
    })

    if (!listing || listing.driverId !== driver.id) {
      return NextResponse.json({ error: 'Listing not found or permission denied' }, { status: 404 })
    }

    await prisma.driverListing.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    console.error('Error deleting driver listing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
