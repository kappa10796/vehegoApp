import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET || 'himalayan-ride-super-secret-key-2026'
const key = new TextEncoder().encode(secretKey)

async function getSessionFromReq(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  if (!sessionCookie) return null
  try {
    const { payload } = await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] })
    return payload?.user as { id: string; email: string; role: string; name: string } | null
  } catch {
    return null
  }
}

// GET /api/custom-tours -> List logged-in user's custom tour requests
export async function GET(request: NextRequest) {
  const user = await getSessionFromReq(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const requests = await prisma.customTourRequest.findMany({
      where: { customerId: user.id },
      include: {
        quotes: {
          include: {
            driver: {
              include: {
                user: { select: { name: true, phone: true, email: true } },
                vehicles: true
              }
            },
            vehicle: true
          },
          orderBy: { quotedPrice: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error('Error fetching customer custom tours:', error)
    return NextResponse.json({ error: 'Failed to fetch custom tours' }, { status: 500 })
  }
}

// POST /api/custom-tours -> Create new day-by-day custom tour request
export async function POST(request: NextRequest) {
  const user = await getSessionFromReq(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please login to post a custom tour request.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, startCity, startDate, totalDays, passengers, preferredCab, dayItinerary, specialNotes } = body

    if (!startCity || !startDate || !totalDays || !dayItinerary || !Array.isArray(dayItinerary)) {
      return NextResponse.json({ error: 'Missing required tour itinerary fields' }, { status: 400 })
    }

    const tourRequest = await prisma.customTourRequest.create({
      data: {
        customerId: user.id,
        title: title || `${totalDays}-Day Custom Himalayan Tour from ${startCity}`,
        startCity,
        startDate: new Date(startDate),
        totalDays: parseInt(totalDays, 10) || 1,
        passengers: parseInt(passengers, 10) || 1,
        preferredCab: preferredCab || 'ANY',
        dayItinerary: typeof dayItinerary === 'string' ? dayItinerary : JSON.stringify(dayItinerary),
        specialNotes: specialNotes || '',
        status: 'OPEN'
      }
    })

    return NextResponse.json({ success: true, tourRequest })
  } catch (error: any) {
    console.error('Error creating custom tour request:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create tour request' }, { status: 500 })
  }
}
