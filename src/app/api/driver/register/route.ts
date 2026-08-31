import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 })
    }

    const userId = auth.user.id
    const body = await req.json()
    const { licenseNumber, experience, brand, model, category, seatingCapacity, acStatus, registration, phone } = body

    if (!licenseNumber || !brand || !model || !category || !registration) {
      return NextResponse.json({ error: 'Missing required driver or vehicle information.' }, { status: 400 })
    }

    // Check if user already has driver profile
    const existingDriver = await prisma.driver.findUnique({
      where: { userId }
    })

    if (existingDriver) {
      return NextResponse.json({ error: 'Driver profile already registered for this user.' }, { status: 400 })
    }

    // Check vehicle registration unique
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registration }
    })
    if (existingVehicle) {
      return NextResponse.json({ error: 'Vehicle registration number already exists.' }, { status: 400 })
    }

    // Create Driver in PENDING status with direct name, email, phone, and userType: PENDING_DRIVER
    const driver = await prisma.driver.create({
      data: {
        userId,
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || phone || null,
        userType: 'PENDING_DRIVER',
        licenseNumber,
        experience: Number(experience) || 1,
        status: 'PENDING',
        availability: 'OFFLINE',
        vehicles: {
          create: {
            brand,
            model,
            category,
            seatingCapacity: Number(seatingCapacity) || 4,
            acStatus: acStatus ?? true,
            registration,
            available: false // Vehicle activated upon Admin approval
          }
        }
      },
      include: {
        vehicles: true
      }
    })

    return NextResponse.json({ driver }, { status: 201 })
  } catch (error) {
    console.error('Error registering driver:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
