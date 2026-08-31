import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const pricingRules = await prisma.pricingRule.findMany({
      orderBy: { baseFare: 'asc' }
    })
    return NextResponse.json({ pricingRules })
  } catch (error) {
    console.error('Error fetching admin pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { category, baseFare, perKmRate, driverAllowance, tollEstimate, nightCharge, platformFeePct } = await req.json()
    if (!category) return NextResponse.json({ error: 'Category required' }, { status: 400 })

    const updated = await prisma.pricingRule.upsert({
      where: { category },
      update: {
        baseFare: Number(baseFare),
        perKmRate: Number(perKmRate),
        driverAllowance: Number(driverAllowance),
        tollEstimate: Number(tollEstimate),
        nightCharge: Number(nightCharge),
        platformFeePct: Number(platformFeePct)
      },
      create: {
        category,
        baseFare: Number(baseFare),
        perKmRate: Number(perKmRate),
        driverAllowance: Number(driverAllowance),
        tollEstimate: Number(tollEstimate),
        nightCharge: Number(nightCharge),
        platformFeePct: Number(platformFeePct)
      }
    })

    return NextResponse.json({ pricingRule: updated })
  } catch (error) {
    console.error('Error updating pricing rule:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
