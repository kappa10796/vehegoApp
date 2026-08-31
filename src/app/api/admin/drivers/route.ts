import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        vehicles: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ drivers })
  } catch (error) {
    console.error('Error fetching admin drivers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth || auth.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { driverId, status, rejectionReason } = await req.json()
    if (!driverId || !['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid driver status' }, { status: 400 })
    }

    const updated = await prisma.driver.update({
      where: { id: driverId },
      data: {
        status,
        userType: status === 'APPROVED' ? 'DRIVER' : 'USER',
        availability: status === 'APPROVED' ? 'AVAILABLE' : 'OFFLINE',
        rejectionReason: status === 'REJECTED' ? (rejectionReason || 'Documents rejected') : null
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        vehicles: true
      }
    })

    // Upon Admin Approval: elevate user role to DRIVER & activate vehicle in public fleet
    if (status === 'APPROVED' && updated.userId) {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { role: 'DRIVER' }
      })
      await prisma.vehicle.updateMany({
        where: { driverId: updated.id },
        data: { available: true }
      })
    } else if (status === 'REJECTED' && updated.userId) {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { role: 'USER' }
      })
      await prisma.vehicle.updateMany({
        where: { driverId: updated.id },
        data: { available: false }
      })
    }

    return NextResponse.json({ driver: updated })
  } catch (error) {
    console.error('Error updating driver status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
