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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const routeId = searchParams.get('routeId')
  const driverListingId = searchParams.get('driverListingId')
  const timeParam = searchParams.get('time') || '09:00'
  const queryTotalFare = searchParams.get('totalFare')

  try {
    // Check if driver listing is provided or ID is listing-based
    if (driverListingId || id.startsWith('driver-listing-')) {
      const listingId = driverListingId || id.replace('driver-listing-', '')
      const listing = await prisma.driverListing.findUnique({
        where: { id: listingId },
        include: {
          driver: { include: { user: true } },
          vehicle: true
        }
      })

      if (listing) {
        const vehicle = listing.vehicle || (await prisma.vehicle.findFirst({ include: { driver: { include: { user: true } } } }))
        const slotInfo = getActiveSlotInfo(timeParam, listing.customPrice, listing.timeSlotPricing)
        const finalFare = queryTotalFare ? Number(queryTotalFare) : slotInfo.activePrice

        return NextResponse.json({
          vehicle,
          route: { origin: listing.origin || 'Siliguri', destination: listing.destination || 'Gangtok' },
          fare: {
            baseFare: finalFare,
            driverAllowance: 0,
            tollEstimate: 0,
            platformFee: 0,
            totalFare: finalFare,
            isCustomSlot: slotInfo.isCustomSlot,
            activeSlotLabel: slotInfo.slotLabel
          },
          driverListing: listing
        })
      }
    }

    // Handle fallback if id is "new"
    let targetVehicleId = id
    if (id === 'new') {
      const searchVehicleId = searchParams.get('vehicleId')
      if (searchVehicleId) {
        targetVehicleId = searchVehicleId
      } else {
        const v = await prisma.vehicle.findFirst()
        targetVehicleId = v?.id || ''
      }
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: targetVehicleId },
      include: {
        driver: {
          include: { user: true }
        }
      }
    })

    if (!vehicle) {
      // Fallback vehicle for demo if vehicle table is empty
      const fallbackVehicle = {
        id: 'fallback-v1',
        brand: 'Mahindra',
        model: 'Bolero Neo / SUV',
        category: 'SUV',
        seatingCapacity: 6,
        acStatus: true,
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600',
        driver: {
          id: 'fallback-d1',
          experience: 5,
          user: { name: 'Verified Himalayan Driver' }
        }
      }

      let route = null
      let fare = { baseFare: 2500, driverAllowance: 300, tollEstimate: 200, platformFee: 100, totalFare: 3100 }
      if (routeId) {
        route = await prisma.route.findUnique({ where: { id: routeId } })
      }

      return NextResponse.json({ vehicle: fallbackVehicle, route: route || { origin: 'Siliguri', destination: 'Gangtok' }, fare })
    }

    let route = null
    let fare = null

    if (routeId) {
      route = await prisma.route.findUnique({ where: { id: routeId } })
    }

    if (route) {
      const rule = await prisma.pricingRule.findUnique({ where: { category: vehicle.category } })
      const perKm = rule?.perKmRate || 25
      const base = rule?.baseFare || 500
      const distanceCharge = route.distance * perKm
      const baseFare = Math.max(base, distanceCharge)
      const allowance = rule?.driverAllowance || 300
      const toll = rule?.tollEstimate || 200
      const subtotal = baseFare + allowance + toll
      const platformFee = Math.round((subtotal * (rule?.platformFeePct || 5)) / 100)
      
      fare = {
        baseFare,
        driverAllowance: allowance,
        tollEstimate: toll,
        platformFee,
        totalFare: subtotal + platformFee
      }
    } else {
      fare = {
        baseFare: 2500,
        driverAllowance: 300,
        tollEstimate: 200,
        platformFee: 100,
        totalFare: 3100
      }
    }

    return NextResponse.json({ vehicle, route, fare })
  } catch (error) {
    console.error('Error fetching cab details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
