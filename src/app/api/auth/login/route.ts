import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { setSession } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    let driverStatus = null
    if (user.role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({ where: { userId: user.id } })
      driverStatus = driver?.status || 'PENDING'
    }

    // Set JWT cookie session
    await setSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      driverStatus
    })

    return NextResponse.json({ 
      user: { id: user.id, email: user.email, role: user.role, name: user.name, driverStatus } 
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
