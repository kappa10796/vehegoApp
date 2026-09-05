import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/custom-tours/public -> Publicly list all customer custom tour requests with driver price quotes
export async function GET(request: NextRequest) {
  try {
    const tourRequests = await prisma.customTourRequest.findMany({
      include: {
        customer: { select: { name: true } },
        quotes: {
          include: {
            driver: {
              include: {
                user: { select: { name: true, phone: true } },
                vehicles: true
              }
            },
            vehicle: true
          },
          orderBy: { quotedPrice: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ tourRequests })
  } catch (error: any) {
    console.error('Error fetching public custom tour requests:', error)
    return NextResponse.json({ error: 'Failed to fetch custom tours' }, { status: 500 })
  }
}
