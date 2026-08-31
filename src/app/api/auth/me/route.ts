import { NextResponse, NextRequest } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAuth(req)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let driverStatus = null
    if (session.user.role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({ where: { userId: session.user.id } })
      driverStatus = driver?.status || 'PENDING'
    }

    return NextResponse.json({
      user: {
        ...session.user,
        driverStatus
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
