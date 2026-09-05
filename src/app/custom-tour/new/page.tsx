'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, Car, Sparkles, Plus, Trash2, CheckCircle2, ArrowRight, ShieldCheck, HelpCircle, Compass } from 'lucide-react'

interface DayPlan {
  day: number
  title: string
  details: string
}

export default function NewCustomTourPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [startCity, setStartCity] = useState('Siliguri')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [totalDays, setTotalDays] = useState(3)
  const [passengers, setPassengers] = useState(2)
  const [preferredCab, setPreferredCab] = useState('SUV')
  const [specialNotes, setSpecialNotes] = useState('')

  // Day-wise itinerary state
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([
    { day: 1, title: 'Day 1: Arrival & Travel to Gangtok', details: 'Pickup from Siliguri/Bagdogra. Scenic drive along Teesta river to Gangtok hotel. Evening stroll at MG Marg.' },
    { day: 2, title: 'Day 2: Tsomgo Lake & Baba Mandir Excursion', details: 'Full day sightseeing trip to Tsomgo Lake (12,400 ft) and Baba Harbhajan Singh Mandir. Return to Gangtok.' },
    { day: 3, title: 'Day 3: Gangtok to Darjeeling & Sunset', details: 'Morning drive to Darjeeling via Kalimpong route. Evening visit to Chowrasta Mall and local tea gardens.' }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTotalDaysChange = (newCount: number) => {
    const days = Math.max(1, Math.min(15, newCount))
    setTotalDays(days)

    // Adjust dayPlans array size dynamically
    if (days > dayPlans.length) {
      const added: DayPlan[] = []
      for (let i = dayPlans.length + 1; i <= days; i++) {
        added.push({
          day: i,
          title: `Day ${i}: Sightseeing & Travel`,
          details: `Write down touring details and cab requirements for Day ${i}...`
        })
      }
      setDayPlans([...dayPlans, ...added])
    } else if (days < dayPlans.length) {
      setDayPlans(dayPlans.slice(0, days))
    }
  }

  const updateDayPlan = (index: number, field: 'title' | 'details', value: string) => {
    const updated = [...dayPlans]
    updated[index][field] = value
    setDayPlans(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/custom-tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `${totalDays}-Day Custom Himalayan Tour from ${startCity}`,
          startCity,
          startDate,
          totalDays,
          passengers,
          preferredCab,
          dayItinerary: dayPlans,
          specialNotes
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?redirect=/custom-tour/new')
          return
        }
        throw new Error(data.error || 'Failed to submit custom tour request')
      }

      router.push(`/dashboard/custom-tours/${data.tourRequest.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans text-slate-900">
      <main className="container mx-auto px-4 max-w-5xl">
        {/* Header Hero Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-xl mb-8 relative overflow-hidden border-b-4 border-[#E34234]">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#E34234]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-red-300 mb-3">
              <Sparkles className="w-4 h-4 text-amber-300" /> Custom Tour Request Builder
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Design Your Multi-Day Himalayan Tour
            </h1>
            <p className="text-slate-300 mt-2 text-sm md:text-base max-w-2xl font-medium leading-relaxed">
              Didn&apos;t find a fixed route? List your day-by-day touring itinerary below. Local verified drivers will review your requirements and send you competitive price quotes directly!
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm font-semibold flex items-center justify-between shadow-xs">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-xs underline font-bold">Dismiss</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Requirements Card */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#E34234] text-white flex items-center justify-center text-xs font-black shadow-xs">1</span>
                Basic Tour Requirements
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Tour Title / Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5-Day North Sikkim & Darjeeling Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Pickup / Start Location
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-[#E34234] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siliguri, Bagdogra Airport, NJP"
                    value={startCity}
                    onChange={(e) => setStartCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-[#E34234] absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Total Duration (Days)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={totalDays}
                    onChange={(e) => handleTotalDaysChange(parseInt(e.target.value || '1', 10))}
                    className="w-28 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-sm font-black text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                  />
                  <span className="text-xs font-medium text-slate-500">Days (Itinerary inputs below update automatically)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Number of Passengers
                </label>
                <div className="relative">
                  <Users className="w-5 h-5 text-[#E34234] absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value || '1', 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Preferred Cab Type
                </label>
                <div className="relative">
                  <Car className="w-5 h-5 text-[#E34234] absolute left-3.5 top-3.5" />
                  <select
                    value={preferredCab}
                    onChange={(e) => setPreferredCab(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                  >
                    <option value="ANY">Any Available Vehicle</option>
                    <option value="HATCHBACK">Hatchback (Alto / WagonR / Swift)</option>
                    <option value="SEDAN">Sedan (Dzire / Etios / Xcent)</option>
                    <option value="SUV">SUV (Innova / Ertiga / Bolero)</option>
                    <option value="PREMIUM_SUV">Premium SUV (Innova Crysta / Fortuner)</option>
                    <option value="TEMPO_TRAVELLER">Tempo Traveller (12-26 Seater)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Day-by-Day Itinerary Builder Card */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#E34234] text-white flex items-center justify-center text-xs font-black shadow-xs">2</span>
                Day-by-Day Touring Requirements
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTotalDaysChange(totalDays + 1)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-[#E34234] text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Add Day
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {dayPlans.map((plan, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <span className="w-8 h-8 rounded-xl bg-red-100 text-[#E34234] font-black text-sm flex items-center justify-center border border-red-200 flex-shrink-0">
                        {plan.day}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Day ${plan.day} Route / Title`}
                        value={plan.title}
                        onChange={(e) => updateDayPlan(idx, 'title', e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] w-full sm:w-80 transition"
                      />
                    </div>
                    {dayPlans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleTotalDaysChange(totalDays - 1)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-600 mb-1.5">
                      Cab Usage & Touring Details for Day {plan.day}:
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder={`Describe locations to visit, pickup time, night stay city for Day ${plan.day}...`}
                      value={plan.details}
                      onChange={(e) => updateDayPlan(idx, 'details', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs md:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] leading-relaxed transition"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions & Submit Card */}
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xs space-y-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="w-8 h-8 rounded-xl bg-[#E34234] text-white flex items-center justify-center text-xs font-black shadow-xs">3</span>
              Additional Notes & Request Posting
            </h2>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                Special Instructions / Driver Preferences
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Require hill-experienced driver, AC needed in plains, need assistance with North Sikkim / Nathula permits..."
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-4 py-3 rounded-2xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Free to post. Verified local drivers will review and submit competitive price quotes.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold rounded-2xl shadow-md shadow-[#E34234]/20 flex items-center justify-center gap-2 transition disabled:opacity-50 text-base"
              >
                {loading ? 'Submitting Tour Request...' : 'Post Custom Tour Request →'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
