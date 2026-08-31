import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      where: { active: true },
      orderBy: { distance: 'asc' }
    })
    return NextResponse.json({ routes })
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
