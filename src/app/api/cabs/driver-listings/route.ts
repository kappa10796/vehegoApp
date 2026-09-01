import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function getActiveSlotInfo(timeStr: string | null, basePrice: number, timeSlotPricingStr: string | null) {
  if (!timeStr || !timeSlotPricingStr) {
    return { activePrice: basePrice, slotLabel: null, isCustomSlot: false }
  }

  try {
    const slots = typeof timeSlotPricingStr === 'string' ? JSON.parse(timeSlotPricingStr) : timeSlotPricingStr
    if (!Array.isArray(slots) || slots.length === 0) {
      return { activePrice: basePrice, slotLabel: null, isCustomSlot: false }
    }

    const h = parseInt(timeStr.split(':')[0] || '9', 10)
    const hStart = h.toString().padStart(2, '0')
    const hEnd = ((h + 1) % 24).toString().padStart(2, '0')
    const targetSlotId = `${hStart}:00-${hEnd}:00`

    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = (h % 12 || 12).toString().padStart(2, '0')
    const h12NoPad = (h % 12 || 12).toString()

    const matched = slots.find((s: any) => {
      if (!s) return false
      if (s.slot === targetSlotId || s.slot?.startsWith(hStart)) return true
      if (s.label) {
        if (s.label.includes(`${h12}:00 ${period}`) || s.label.includes(`${h12NoPad}:00 ${period}`) || s.label.includes(`${hStart}:00`)) return true
      }
      return false
    })

    if (matched && matched.price) {
      return {
        activePrice: Number(matched.price),
        slotLabel: matched.label || `${targetSlotId}`,
        isCustomSlot: true
      }
    }
  } catch (e) {
    console.error('Error parsing timeSlotPricing:', e)
  }

  return { activePrice: basePrice, slotLabel: null, isCustomSlot: false }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // ROUTE_RIDE or SIGHTSEEING
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const passengers = Math.max(1, parseInt(searchParams.get('passengers') || '1', 10))

    const whereClause: any = {
      status: 'ACTIVE',
      driver: { status: 'APPROVED' }
    }

    if (type) whereClause.type = type
    if (origin) whereClause.origin = { contains: origin }
    if (destination) whereClause.destination = { contains: destination }

    const rawListings = await prisma.driverListing.findMany({
      where: whereClause,
      include: {
        driver: {
          include: {
            user: { select: { name: true, phone: true, email: true } },
            vehicles: true
          }
        },
        vehicle: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const listings = rawListings
      .filter(item => {
        // Filter by passengers capacity
        if (item.availableSeats && item.availableSeats < passengers) return false
        if (item.vehicle?.seatingCapacity && item.vehicle.seatingCapacity < passengers) return false

        // Filter by date if date parameter is supplied
        if (date && item.availableDate) {
          const listingDateStr = new Date(item.availableDate).toISOString().split('T')[0]
          if (listingDateStr !== date) return false
        }

        return true
      })
      .map(item => {
        const slotInfo = getActiveSlotInfo(time, item.customPrice, item.timeSlotPricing)
        return {
          ...item,
          activePrice: slotInfo.activePrice,
          activeSlotLabel: slotInfo.slotLabel,
          isCustomSlot: slotInfo.isCustomSlot
        }
      })

    return NextResponse.json({ listings })
  } catch (error: any) {
    console.error('Error fetching public driver listings:', error)
    return NextResponse.json({ listings: [], error: error?.message || 'Internal server error' }, { status: 200 })
  }
}
