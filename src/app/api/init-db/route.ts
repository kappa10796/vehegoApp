import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // 1. Seed Pricing Rules
    const pricingRules = [
      { category: 'HATCHBACK', baseFare: 1800, perKmRate: 15, driverAllowance: 300, tollEstimate: 100, nightCharge: 300, platformFeePct: 15.0 },
      { category: 'SEDAN', baseFare: 2200, perKmRate: 18, driverAllowance: 350, tollEstimate: 100, nightCharge: 350, platformFeePct: 15.0 },
      { category: 'SUV', baseFare: 3200, perKmRate: 25, driverAllowance: 500, tollEstimate: 150, nightCharge: 500, platformFeePct: 15.0 },
      { category: 'PREMIUM_SUV', baseFare: 4500, perKmRate: 35, driverAllowance: 700, tollEstimate: 200, nightCharge: 700, platformFeePct: 15.0 },
      { category: 'TEMPO_TRAVELLER', baseFare: 6000, perKmRate: 45, driverAllowance: 1000, tollEstimate: 300, nightCharge: 1000, platformFeePct: 15.0 },
    ]

    for (const rule of pricingRules) {
      await prisma.pricingRule.upsert({
        where: { category: rule.category },
        update: rule,
        create: rule,
      })
    }

    // 2. Seed Default Routes
    const defaultRoutes = [
      { origin: 'Siliguri', destination: 'Darjeeling', distance: 62.0, duration: 150, basePrice: 2200 },
      { origin: 'Siliguri', destination: 'Gangtok', distance: 114.0, duration: 240, basePrice: 3200 },
      { origin: 'Siliguri', destination: 'Kalimpong', distance: 68.0, duration: 160, basePrice: 2400 },
      { origin: 'Bagdogra', destination: 'Darjeeling', distance: 70.0, duration: 180, basePrice: 2500 },
      { origin: 'Bagdogra', destination: 'Gangtok', distance: 124.0, duration: 270, basePrice: 3500 },
      { origin: 'Bagdogra', destination: 'Kalimpong', distance: 75.0, duration: 190, basePrice: 2600 },
      { origin: 'NJP', destination: 'Darjeeling', distance: 72.0, duration: 180, basePrice: 2500 },
      { origin: 'NJP', destination: 'Gangtok', distance: 120.0, duration: 260, basePrice: 3400 },
      { origin: 'NJP', destination: 'Kalimpong', distance: 73.0, duration: 185, basePrice: 2600 },
      { origin: 'Gangtok', destination: 'Nathula Pass', distance: 56.0, duration: 180, basePrice: 4500 },
    ]

    for (const r of defaultRoutes) {
      await prisma.route.upsert({
        where: {
          origin_destination: {
            origin: r.origin,
            destination: r.destination
          }
        },
        update: { active: true, basePrice: r.basePrice },
        create: {
          origin: r.origin,
          destination: r.destination,
          distance: r.distance,
          duration: r.duration,
          basePrice: r.basePrice,
          active: true
        }
      })
    }

    // 3. Seed Default Admin User
    await prisma.user.upsert({
      where: { email: 'admin@himalayanride.com' },
      update: { role: 'ADMIN' },
      create: {
        name: 'HimalayanRide Admin',
        email: 'admin@himalayanride.com',
        password: 'AdminPassword2026!',
        phone: '+91 9876543210',
        role: 'ADMIN',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Database routes, pricing rules, and admin user initialized successfully!',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Failed to initialize database:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Database initialization failed'
    }, { status: 500 })
  }
}
