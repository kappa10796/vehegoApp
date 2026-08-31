"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

export default function DriverRegisterPage() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Form State
  const [licenseNumber, setLicenseNumber] = useState('')
  const [experience, setExperience] = useState('5')
  const [brand, setBrand] = useState('Toyota')
  const [model, setModel] = useState('Innova Crysta')
  const [category, setCategory] = useState('SUV')
  const [seatingCapacity, setSeatingCapacity] = useState('6')
  const [acStatus, setAcStatus] = useState(true)
  const [registration, setRegistration] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login?redirect=/driver/register')
        } else {
          setUser(data.user)
        }
        setLoadingUser(false)
      })
      .catch(() => setLoadingUser(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/driver/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseNumber,
          experience: Number(experience),
          brand,
          model,
          category,
          seatingCapacity: Number(seatingCapacity),
          acStatus,
          registration
        })
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch {
      setError('Connection error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingUser) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm max-w-lg text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Thank you, <span className="font-semibold text-slate-900">{user?.name}</span>. Your driver profile and vehicle registration are currently pending VEHEGO Admin verification.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 mb-6 text-left space-y-1 border border-slate-200">
            <p><strong className="text-slate-700">License:</strong> {licenseNumber}</p>
            <p><strong className="text-slate-700">Vehicle:</strong> {brand} {model} ({registration})</p>
            <p><strong className="text-slate-700">Status:</strong> PENDING APPROVAL</p>
          </div>
          <Link href="/driver/dashboard" className="bg-[#E34234] hover:bg-[#c93225] text-white font-bold px-6 py-3 rounded-xl transition-colors inline-block text-sm shadow-md">
            Go to Driver Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100/80 text-[#E34234] rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
            <Car className="w-3.5 h-3.5" /> Commercial Partner Onboarding
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Partner with VEHE<span className="text-[#E34234]">GO</span></h1>
          <p className="text-slate-500 text-sm mt-1">Register your commercial taxi and start earning on mountain routes</p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between mb-8 relative px-4">
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -z-0 -translate-y-1/2" />
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-colors ${
                step >= s ? 'bg-[#E34234] text-white ring-4 ring-red-100' : 'bg-slate-200 text-slate-500'
              }`}>
                {s}
              </div>
              <span className="text-xs font-semibold text-slate-600 mt-2">
                {s === 1 ? 'Personal Info' : s === 2 ? 'License & Exp' : 'Vehicle Details'}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Step 1: Confirm Personal Info</h3>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                  <input type="text" disabled value={user?.name || ''} className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
                  <input type="email" disabled value={user?.email || ''} className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone Number</label>
                  <input type="tel" disabled value={user?.phone || 'Not provided'} className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-4 text-slate-900 font-bold" />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="button" onClick={() => setStep(2)} className="bg-[#E34234] hover:bg-[#c93225] text-white font-bold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 text-sm shadow-md">
                    Next: License Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: License & Experience */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Step 2: License & Driving Experience</h3>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Driving License Number *</label>
                  <input
                    type="text" required placeholder="WB-2026-1234567" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 font-extrabold focus:ring-2 focus:ring-[#E34234] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Himalayan Driving Experience (Years) *</label>
                  <select
                    value={experience} onChange={e => setExperience(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 font-extrabold focus:ring-2 focus:ring-[#E34234] outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(y => (
                      <option key={y} value={y}>{y} {y === 1 ? 'Year' : 'Years'}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button type="button" onClick={() => setStep(1)} className="text-slate-600 font-semibold px-4 py-2 text-sm inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="button" onClick={() => {
                    if (!licenseNumber) { setError('License number is required'); return }
                    setError('')
                    setStep(3)
                  }} className="bg-[#E34234] hover:bg-[#c93225] text-white font-bold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2 text-sm shadow-md">
                    Next: Vehicle Info <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vehicle Details */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-3">Step 3: Commercial Vehicle Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Brand *</label>
                    <input
                      type="text" required placeholder="Toyota / Mahindra" value={brand} onChange={e => setBrand(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 font-extrabold focus:ring-2 focus:ring-[#E34234] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Model Name *</label>
                    <input
                      type="text" required placeholder="Innova / Bolero / WagonR" value={model} onChange={e => setModel(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 font-extrabold focus:ring-2 focus:ring-[#E34234] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category *</label>
                    <select
                      value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 font-extrabold focus:ring-2 focus:ring-[#E34234] outline-none bg-white"
                    >
                      <option value="HATCHBACK">Hatchback (WagonR/Alto)</option>
                      <option value="SEDAN">Sedan (Dzire/Etios)</option>
                      <option value="SUV">SUV (Bolero/Ertiga/Scorpio)</option>
                      <option value="PREMIUM_SUV">Premium SUV (Innova Crysta)</option>
                      <option value="TEMPO_TRAVELLER">Tempo Traveller (12-26 Seater)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Seating Capacity *</label>
                    <input
                      type="number" required min={3} max={26} value={seatingCapacity} onChange={e => setSeatingCapacity(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 font-extrabold focus:ring-2 focus:ring-[#E34234] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Commercial Registration Number *</label>
                  <input
                    type="text" required placeholder="WB 74 AB 1234" value={registration} onChange={e => setRegistration(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-4 text-slate-900 font-extrabold uppercase focus:ring-2 focus:ring-[#E34234] outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox" id="ac" checked={acStatus} onChange={e => setAcStatus(e.target.checked)}
                    className="w-4 h-4 text-[#E34234] rounded focus:ring-[#E34234]"
                  />
                  <label htmlFor="ac" className="text-sm font-semibold text-slate-700">Air Conditioned (AC) Enabled</label>
                </div>

                <div className="pt-6 flex items-center justify-between border-t">
                  <button type="button" onClick={() => setStep(2)} className="text-slate-600 font-semibold px-4 py-2 text-sm inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2 text-sm shadow-md disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Submit Application
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
