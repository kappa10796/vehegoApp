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

// GET /api/custom-tours/[id] -> Fetch single custom tour request details with quotes
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const tourRequest = await prisma.customTourRequest.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
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
      }
    })

    if (!tourRequest) {
      return NextResponse.json({ error: 'Custom tour request not found' }, { status: 404 })
    }

    return NextResponse.json({ tourRequest })
  } catch (error: any) {
    console.error('Error fetching custom tour request details:', error)
    return NextResponse.json({ error: 'Failed to fetch tour request' }, { status: 500 })
  }
}

// PATCH /api/custom-tours/[id] -> Update existing custom tour request
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionFromReq(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existing = await prisma.customTourRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Custom tour request not found' }, { status: 404 })
    }

    if (existing.customerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. You do not own this tour request.' }, { status: 403 })
    }

    if (existing.status === 'ACCEPTED') {
      return NextResponse.json({ error: 'Cannot edit a custom tour request after accepting a driver quote.' }, { status: 400 })
    }

    const body = await request.json()
    const { title, startCity, startDate, totalDays, passengers, preferredCab, dayItinerary, specialNotes, status } = body

    const updated = await prisma.customTourRequest.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(startCity !== undefined && { startCity }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(totalDays !== undefined && { totalDays: parseInt(totalDays, 10) }),
        ...(passengers !== undefined && { passengers: parseInt(passengers, 10) }),
        ...(preferredCab !== undefined && { preferredCab }),
        ...(dayItinerary !== undefined && { dayItinerary: typeof dayItinerary === 'string' ? dayItinerary : JSON.stringify(dayItinerary) }),
        ...(specialNotes !== undefined && { specialNotes }),
        ...(status !== undefined && { status })
      }
    })

    return NextResponse.json({ success: true, tourRequest: updated })
  } catch (error: any) {
    console.error('Error updating custom tour request:', error)
    return NextResponse.json({ error: error?.message || 'Failed to update custom tour request' }, { status: 500 })
  }
}

// DELETE /api/custom-tours/[id] -> Cancel / Delete custom tour request
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionFromReq(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existing = await prisma.customTourRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Custom tour request not found' }, { status: 404 })
    }

    if (existing.customerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.customTourRequest.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ success: true, tourRequest: updated })
  } catch (error: any) {
    console.error('Error cancelling custom tour request:', error)
    return NextResponse.json({ error: error?.message || 'Failed to cancel custom tour request' }, { status: 500 })
  }
}
