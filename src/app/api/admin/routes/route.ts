import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const routes = await prisma.route.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ routes })
  } catch (error) {
    console.error('Error fetching admin routes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { origin, destination, distance, duration, basePrice } = await req.json()
    if (!origin || !destination || !distance || !duration) {
      return NextResponse.json({ error: 'Missing required route fields' }, { status: 400 })
    }

    const newRoute = await prisma.route.create({
      data: {
        origin,
        destination,
        distance: Number(distance),
        duration: Number(duration),
        basePrice: Number(basePrice) || 0,
        active: true
      }
    })

    return NextResponse.json({ route: newRoute }, { status: 201 })
  } catch (error) {
    console.error('Error creating route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id, origin, destination, distance, duration, basePrice, active } = await req.json()
    if (!id) return NextResponse.json({ error: 'Route ID required' }, { status: 400 })

    const updated = await prisma.route.update({
      where: { id },
      data: {
        ...(origin && { origin }),
        ...(destination && { destination }),
        ...(distance && { distance: Number(distance) }),
        ...(duration && { duration: Number(duration) }),
        ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
        ...(active !== undefined && { active: Boolean(active) })
      }
    })

    return NextResponse.json({ route: updated })
  } catch (error) {
    console.error('Error updating route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
