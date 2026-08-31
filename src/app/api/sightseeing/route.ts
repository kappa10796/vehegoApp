import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const packages = await prisma.sightseeingPackage.findMany({
      where: { active: true }
    })
    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
