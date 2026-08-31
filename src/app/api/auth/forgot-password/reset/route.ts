import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
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
      return NextResponse.json({ error: 'Invalid or expired OTP verification' }, { status: 400 })
    }

    // Update user password
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { password: newPassword }
    })

    // Mark OTP as used
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { used: true }
    })

    return NextResponse.json({ message: 'Password has been reset successfully.' })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
