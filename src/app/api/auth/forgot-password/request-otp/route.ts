import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'No VEHEGO account found with this email address' }, { status: 404 })
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes validity

    // Invalidate existing unused OTPs for this email
    await prisma.passwordResetOtp.updateMany({
      where: { email: user.email, used: false },
      data: { used: true }
    })

    // Create new OTP record in DB
    await prisma.passwordResetOtp.create({
      data: {
        email: user.email,
        otp,
        expiresAt
      }
    })

    // Dispatch OTP email via mailer service
    const emailResult = await sendOtpEmail(user.email, otp, user.name).catch((err) => {
      console.error('Failed to send email:', err)
      return null
    })

    return NextResponse.json({
      message: `OTP sent successfully to ${user.email}`,
      otp, // Demo mode preview
      email: user.email,
      previewUrl: emailResult?.previewUrl || null
    })
  } catch (error) {
    console.error('Error requesting OTP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
