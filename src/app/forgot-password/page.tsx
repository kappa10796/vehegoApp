"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, Loader2, KeyRound, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [demoOtp, setDemoOtp] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(600) // 10 minutes timer

  const router = useRouter()

  useEffect(() => {
    let interval: any = null
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      setDemoOtp(data.otp)
      setPreviewUrl(data.previewUrl || null)
      setStep(2)
      setTimer(600)
      setSuccessMsg('OTP code sent successfully to your email!')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP code')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'OTP Verification failed')
        setLoading(false)
        return
      }

      setStep(3)
    } catch {
      setError('Error verifying OTP code')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        setLoading(false)
        return
      }

      setStep(4)
    } catch {
      setError('Error completing password reset')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-[#E34234] rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-[#E34234]/30">
            <KeyRound className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">VEHE<span className="text-[#E34234]">GO</span></h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed mx-auto">
            Secure Password Recovery with Instant 2-Factor OTP Authentication.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-[#E34234] rounded-xl flex items-center justify-center text-white">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-3xl text-slate-900">VEHE<span className="text-[#E34234]">GO</span></span>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between mb-8 relative px-2">
            <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-200 -z-0 -translate-y-1/2 rounded-full" />
            <div className="absolute top-1/2 left-6 h-1 bg-[#E34234] -z-0 -translate-y-1/2 rounded-full transition-all" style={{ width: `${(step - 1) * 33}%` }} />
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center relative z-10 transition-all ${
                step >= s ? 'bg-[#E34234] text-white ring-4 ring-red-100 shadow-md shadow-[#E34234]/20' : 'bg-white border-2 border-slate-200 text-slate-400'
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-xs font-extrabold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Forgot Password?</h2>
              <p className="text-slate-500 text-sm mb-6 font-medium">Enter your registered email address to receive a 6-digit OTP verification code.</p>

              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] outline-none bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-[#E34234] hover:bg-[#c93225] disabled:bg-red-300 text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md text-base shadow-[#E34234]/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Send OTP Code to Email</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#E34234] font-extrabold text-sm">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Enter OTP Code</h2>
              <p className="text-slate-500 text-sm mb-4 font-medium">An email with your 6-digit security code was dispatched to <strong className="text-slate-900">{email}</strong>.</p>

              {/* EMAIL INBOX PREVIEW BANNER */}
              {previewUrl && (
                <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                    <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Real-time Email Sent!</span>
                  </div>
                  <a
                    href={previewUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <span>View Sent Email</span> <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* DEMO OTP PREVIEW NOTIFICATION */}
              {demoOtp && (
                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl mb-6 flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#E34234] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-red-900 uppercase tracking-wider">Generated OTP Code</p>
                    <p className="text-2xl font-black font-mono text-[#E34234] mt-0.5 tracking-widest">{demoOtp}</p>
                    <p className="text-[11px] text-red-700 font-semibold mt-0.5">Use this 6-digit code to verify your request.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">6-Digit Verification Code</label>
                    <span className="text-xs font-extrabold text-[#E34234] font-mono">Expires in {formatTime(timer)}</span>
                  </div>
                  <input
                    type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.5em] font-mono py-3.5 border-2 border-slate-300 rounded-xl focus:border-[#E34234] focus:ring-2 focus:ring-[#E34234] outline-none bg-white text-slate-900 font-black text-2xl placeholder:text-slate-300 placeholder:tracking-normal"
                    placeholder="••••••"
                  />
                </div>

                <button
                  type="submit" disabled={loading || otp.length !== 6}
                  className="w-full bg-[#E34234] hover:bg-[#c93225] disabled:bg-red-300 text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md text-base shadow-[#E34234]/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Verify OTP & Continue</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs">
                <button type="button" onClick={() => setStep(1)} className="text-slate-600 hover:text-slate-900 font-extrabold flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                </button>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-[#E34234] hover:underline font-extrabold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Email OTP
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Set New Password */}
          {step === 3 && (
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Reset Password</h2>
              <p className="text-slate-500 text-sm mb-6 font-medium">Create a new password for <strong className="text-slate-900">{email}</strong>.</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] outline-none bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] outline-none bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400"
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-[#E34234] hover:bg-[#c93225] disabled:bg-red-300 text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md text-base shadow-[#E34234]/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Reset Password</span><CheckCircle2 className="w-4 h-4" /></>}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Password Reset Complete!</h2>
              <p className="text-slate-600 font-medium text-sm mb-8">
                Your VEHEGO account password for <strong className="text-slate-900">{email}</strong> has been successfully updated. You can now sign in with your new password.
              </p>

              <Link
                href="/login"
                className="w-full bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold py-3.5 px-6 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-md text-base shadow-[#E34234]/20"
              >
                Go to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
