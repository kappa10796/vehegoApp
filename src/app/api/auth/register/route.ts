import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, role } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password, // plain text for demo
        role: role === 'DRIVER' ? 'DRIVER' : 'USER'
      }
    })

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
