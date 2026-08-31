import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { availability } = await req.json()
    if (!['AVAILABLE', 'OFFLINE', 'ON_TRIP'].includes(availability)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: auth.user.id }
    })

    if (!driver) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { availability }
    })

    return NextResponse.json({ driver: updated })
  } catch (error) {
    console.error('Error toggling availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
