import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, origin, destination, category = 'SUV' } = body

    // Lookup Pricing Rule for vehicle category
    const pricingRule = await prisma.pricingRule.findUnique({
      where: { category: category.toUpperCase() }
    }) || await prisma.pricingRule.findFirst()

    const baseKmRate = pricingRule?.perKmRate || 22
    const baseFare = pricingRule?.baseFare || 2500
    const allowance = pricingRule?.driverAllowance || 500

    let estimatedDistance = 75
    let suggestedPrice = 3000

    if (type === 'ROUTE_RIDE' && origin && destination) {
      const route = await prisma.route.findFirst({
        where: {
          origin: { contains: origin },
          destination: { contains: destination }
        }
      })

      if (route) {
        estimatedDistance = route.distance
        const rawFare = Math.max(baseFare, route.distance * baseKmRate) + allowance + (pricingRule?.tollEstimate || 100)
        suggestedPrice = Math.round(rawFare)
      } else {
        // Fallback distance calculation based on common sectors
        if (origin.toLowerCase().includes('njp') || origin.toLowerCase().includes('siliguri')) {
          if (destination.toLowerCase().includes('gangtok')) estimatedDistance = 115
          else if (destination.toLowerCase().includes('darjeeling')) estimatedDistance = 70
          else if (destination.toLowerCase().includes('kalimpong')) estimatedDistance = 75
          else if (destination.toLowerCase().includes('pelling')) estimatedDistance = 130
        }
        const rawFare = Math.max(baseFare, estimatedDistance * baseKmRate) + allowance
        suggestedPrice = Math.round(rawFare)
      }
    } else if (type === 'SIGHTSEEING') {
      // Sightseeing standard market rates
      if (destination?.toLowerCase().includes('tiger hill') || destination?.toLowerCase().includes('darjeeling')) {
        suggestedPrice = 3400
      } else if (destination?.toLowerCase().includes('tsomgo') || destination?.toLowerCase().includes('nathula')) {
        suggestedPrice = 4500
      } else {
        suggestedPrice = 3800
      }
    }

    // Dynamic demand multiplier (+10% peak demand surge)
    const activeBookingsCount = await prisma.booking.count({
      where: { status: { in: ['CONFIRMED', 'DRIVER_ASSIGNED'] } }
    })
    const demandMultiplier = activeBookingsCount > 2 ? 1.12 : 1.05
    const finalSuggested = Math.round((suggestedPrice * demandMultiplier) / 50) * 50

    return NextResponse.json({
      suggestedPrice: finalSuggested,
      minRecommended: Math.round((finalSuggested * 0.85) / 50) * 50,
      maxRecommended: Math.round((finalSuggested * 1.25) / 50) * 50,
      estimatedDistance,
      demandLevel: activeBookingsCount > 2 ? 'HIGH_DEMAND' : 'MODERATE',
      breakdown: {
        baseFare: pricingRule?.baseFare || 2500,
        perKmRate: baseKmRate,
        driverAllowance: allowance
      }
    })
  } catch (error) {
    console.error('Error suggesting price:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
