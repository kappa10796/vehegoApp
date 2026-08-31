"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      router.refresh()
      const role = data.user.role
      if (role === 'ADMIN') {
        router.push('/admin')
      } else if (role === 'DRIVER') {
        // If driver status is approved, direct to custom rides & sightseeing page!
        if (data.user.driverStatus === 'APPROVED' || !data.user.driverStatus) {
          router.push('/driver/listings')
        } else {
          router.push('/driver/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-[#E34234] rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-[#E34234]/30">
            <Car className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">VEHE<span className="text-[#E34234]">GO</span></h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed mx-auto">
            Your gateway to comfortable mountain cab bookings across North Bengal & Sikkim. Book verified cabs for Darjeeling, Gangtok, Kalimpong and beyond.
          </p>
          <div className="mt-10 flex gap-4 justify-center text-sm text-slate-300">
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur">✓ Verified Drivers</div>
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur">✓ Best Prices</div>
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur">✓ 24/7 Support</div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-[#E34234] rounded-xl flex items-center justify-center text-white">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-3xl text-slate-900">VEHE<span className="text-[#E34234]">GO</span></span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8 font-medium">Sign in to your VEHEGO account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-extrabold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-slate-800 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] focus:border-[#E34234] outline-none transition-all bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-black text-slate-800">Password</label>
                <Link href="/forgot-password" className="text-xs font-black text-[#E34234] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] focus:border-[#E34234] outline-none transition-all bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#E34234] hover:bg-[#c93225] disabled:bg-red-300 text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md text-base shadow-[#E34234]/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-8 text-sm font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#E34234] font-black hover:underline">Create one</Link>
          </p>

          <div className="mt-6 p-4 bg-white rounded-2xl text-xs text-slate-600 border border-slate-200 shadow-sm">
            <p className="font-black text-slate-900 mb-1 uppercase tracking-wider text-[10px]">Demo Accounts:</p>
            <p><strong className="text-slate-900">Admin:</strong> podderkalpataru10@gmail.com / vehego@123</p>
            <p><strong className="text-slate-900">Customer:</strong> customer@demo.com / demo123</p>
            <p><strong className="text-slate-900">Driver:</strong> driver@demo.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
