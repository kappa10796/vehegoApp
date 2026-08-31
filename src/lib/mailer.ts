import nodemailer from 'nodemailer'

/**
 * Mailer service for sending transactional emails (like Password Reset OTPs).
 * 
 * You can configure environment variables in .env:
 * - SMTP_HOST (e.g. smtp.gmail.com or smtp.resend.com)
 * - SMTP_PORT (e.g. 587 or 465)
 * - SMTP_USER (e.g. your email address)
 * - SMTP_PASS (e.g. App Password or SMTP key)
 * - SMTP_FROM (e.g. "VEHEGO Cabs" <no-reply@vehego.com>)
 */
export async function sendOtpEmail(toEmail: string, otpCode: string, userName?: string) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || '"VEHEGO Cabs" <no-reply@vehego.com>'

  let transporter: nodemailer.Transporter

  if (host && user && pass) {
    // Real SMTP configuration
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    })
  } else {
    // Ethereal / Test Transporter fallback for development & instant preview
    console.log(`\n[EMAIL MAILER SERVICE] Sending Password Reset OTP to ${toEmail}...`)
    console.log(`🔑 OTP CODE GENERATED FOR ${toEmail}: ${otpCode}\n`)

    // Create test SMTP account automatically using Ethereal Mail
    try {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
    } catch {
      // Fallback if network is offline
      return {
        sent: true,
        previewUrl: null,
        message: 'OTP generated and logged to server console.'
      }
    }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
          .logo span { color: #E34234; }
          .otp-box { background: #fef2f2; border: 2px dashed #E34234; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #E34234; font-family: monospace; }
          .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 28px; border-t: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">VEHE<span>GO</span></div>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Mountain Taxi & Cab Booking Service</p>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 8px;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Hello ${userName || 'User'},<br/>
            We received a request to change your VEHEGO account password. Please use the 6-digit OTP verification code below to proceed:
          </p>

          <div class="otp-box">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #991b1b; letter-spacing: 1px; margin-bottom: 6px;">Your 6-Digit OTP Code</div>
            <div class="otp-code">${otpCode}</div>
            <div style="font-size: 12px; color: #b91c1c; margin-top: 6px;">Valid for 10 minutes</div>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
            If you did not initiate this password reset request, please ignore this email or contact support. Your password will remain unchanged.
          </p>

          <div class="footer">
            &copy; 2026 VEHEGO Cabs (North Bengal & Sikkim Mountain Fleet). All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `

  const info = await transporter.sendMail({
    from,
    to: toEmail,
    subject: `${otpCode} is your VEHEGO Password Reset OTP Code`,
    text: `Your VEHEGO password reset OTP code is ${otpCode}. It is valid for 10 minutes.`,
    html: htmlContent
  })

  const previewUrl = nodemailer.getTestMessageUrl(info) || null
  if (previewUrl) {
    console.log(`📩 Real-time Ethereal Email Preview URL: ${previewUrl}`)
  }

  return {
    sent: true,
    messageId: info.messageId,
    previewUrl
  }
}
