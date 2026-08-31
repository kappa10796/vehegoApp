import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const time = searchParams.get('time') || '09:00'
  const passengers = Math.max(1, parseInt(searchParams.get('passengers') || '1', 10))

  try {
    let route = null
    
    // Search exact or partial route match
    if (origin || destination) {
      const allRoutes = await prisma.route.findMany({ where: { active: true } })
      route = allRoutes.find(r => 
        (!origin || r.origin.toLowerCase().includes(origin.toLowerCase()) || origin.toLowerCase().includes(r.origin.toLowerCase())) &&
        (!destination || r.destination.toLowerCase().includes(destination.toLowerCase()) || destination.toLowerCase().includes(r.destination.toLowerCase()))
      )

      if (!route && origin && destination) {
        // Reverse route match check
        route = allRoutes.find(r => 
          r.origin.toLowerCase().includes(destination.toLowerCase()) &&
          r.destination.toLowerCase().includes(origin.toLowerCase())
        )
      }
    }

    // Dynamic Route Object if custom route requested by user
    if (!route && origin && destination) {
      route = {
        id: `custom-${Date.now()}`,
        origin: origin,
        destination: destination,
        distance: 100, // Default estimated mountain distance km
        duration: 210, // 3.5 hrs est
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } else if (!route) {
      route = await prisma.route.findFirst({ where: { active: true } })
    }

    if (!route) {
      return NextResponse.json({ results: [] })
    }

    // Check if requested time falls in night bandwidth (20:00 to 06:00)
    const hour = parseInt(time.split(':')[0] || '9', 10)
    const isNight = hour >= 20 || hour < 6

    // Fetch pricing rules
    const rules = await prisma.pricingRule.findMany()
    const rulesMap = rules.reduce((acc, rule) => ({ ...acc, [rule.category]: rule }), {} as any)

    // Filter available vehicles matching requested passengers count
    const vehicles = await prisma.vehicle.findMany({
      where: {
        available: true,
        seatingCapacity: { gte: passengers },
        driver: {
          status: 'APPROVED',
          availability: 'AVAILABLE'
        }
      },
      include: {
        driver: {
          include: { user: true }
        }
      }
    })

    // Calculate fares incorporating distance, allowances, tolls, night charges, and platform fee
    const results = vehicles.map(v => {
      const rule = rulesMap[v.category]
      if (!rule) return null

      const distanceCharge = route.distance * rule.perKmRate
      const baseFare = Math.max(rule.baseFare, distanceCharge)
      const nightFee = isNight ? (rule.nightCharge || 500) : 0
      const subtotal = baseFare + rule.driverAllowance + rule.tollEstimate + nightFee
      const platformFee = Math.round((subtotal * rule.platformFeePct) / 100)
      const totalFare = Math.round(subtotal + platformFee)

      return {
        vehicle: v,
        route,
        date,
        time,
        passengers,
        isNight,
        fare: {
          baseFare,
          driverAllowance: rule.driverAllowance,
          tollEstimate: rule.tollEstimate,
          nightCharge: nightFee,
          platformFee,
          totalFare
        }
      }
    }).filter(Boolean)

    return NextResponse.json({ results, route })
  } catch (error) {
    console.error('Cab search error:', error)
    return NextResponse.json({ error: 'Failed to search cabs' }, { status: 500 })
  }
}
