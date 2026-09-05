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

// POST /api/driver/custom-tours/[id]/quote -> Submit or update driver price quote
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSessionFromReq(request)

  if (!user || (user.role !== 'DRIVER' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: user.id }
    })

    if (!driver || driver.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Driver profile must be approved to submit quotes' }, { status: 403 })
    }

    const body = await request.json()
    const { vehicleId, quotedPrice, notes } = body

    if (!quotedPrice || parseFloat(quotedPrice) <= 0) {
      return NextResponse.json({ error: 'Valid quoted price is required' }, { status: 400 })
    }

    const price = parseFloat(quotedPrice)

    // Check if quote already exists for this driver and request
    const existingQuote = await prisma.customTourQuote.findFirst({
      where: {
        requestId: id,
        driverId: driver.id
      }
    })

    let quote
    if (existingQuote) {
      quote = await prisma.customTourQuote.update({
        where: { id: existingQuote.id },
        data: {
          quotedPrice: price,
          vehicleId: vehicleId || null,
          notes: notes || null,
          status: 'PENDING'
        }
      })
    } else {
      quote = await prisma.customTourQuote.create({
        data: {
          requestId: id,
          driverId: driver.id,
          vehicleId: vehicleId || null,
          quotedPrice: price,
          notes: notes || null,
          status: 'PENDING'
        }
      })
    }

    return NextResponse.json({
      success: true,
      quote,
      message: 'Your custom tour price quote has been submitted to the customer!'
    })
  } catch (error: any) {
    console.error('Error submitting driver quote:', error)
    return NextResponse.json({ error: error?.message || 'Failed to submit price quote' }, { status: 500 })
  }
}
