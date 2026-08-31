import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 400 })
    }

    return NextResponse.json({ valid: true, message: 'OTP verified successfully' })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
