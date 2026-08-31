"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Mail, Lock, Phone, User as UserIcon, ArrowRight, Loader2, MapPin } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'USER' | 'DRIVER'>('USER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      router.push('/login?registered=true')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.12\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-[#E34234] rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-[#E34234]/30">
            <Car className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Join VEHE<span className="text-[#E34234]">GO</span></h1>
          <p className="text-slate-300 text-lg max-w-md leading-relaxed mx-auto">
            Whether you&apos;re exploring the hills or driving through them — we&apos;ve got you covered.
          </p>
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

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-6">Choose how you want to get started with VEHEGO</p>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setRole('USER')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'USER' ? 'border-[#E34234] bg-red-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <MapPin className={`w-6 h-6 mb-2 ${role === 'USER' ? 'text-[#E34234]' : 'text-slate-400'}`} />
              <p className={`font-bold text-sm ${role === 'USER' ? 'text-[#E34234]' : 'text-slate-700'}`}>Book a Ride</p>
              <p className="text-xs text-slate-500 mt-0.5">Travel the Himalayas</p>
            </button>
            <button type="button" onClick={() => setRole('DRIVER')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'DRIVER' ? 'border-emerald-600 bg-emerald-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
              <Car className={`w-6 h-6 mb-2 ${role === 'DRIVER' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <p className={`font-bold text-sm ${role === 'DRIVER' ? 'text-emerald-700' : 'text-slate-700'}`}>Drive with Us</p>
              <p className="text-xs text-slate-500 mt-0.5">Earn with your vehicle</p>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">{error}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] outline-none bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400" placeholder="Your full name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] outline-none bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] outline-none bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#E34234] outline-none bg-white text-slate-900 font-extrabold text-base placeholder:text-slate-400" placeholder="Min 6 characters" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className={`w-full font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md text-white text-base ${role === 'DRIVER' ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400' : 'bg-[#E34234] hover:bg-[#c93225] disabled:bg-red-300 shadow-[#E34234]/20'}`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>{role === 'DRIVER' ? 'Register as Driver' : 'Create Account'}</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-8 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#E34234] font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
