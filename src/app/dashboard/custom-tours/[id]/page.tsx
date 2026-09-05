'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, Car, CheckCircle2, ShieldCheck, Clock, ArrowLeft, Star, FileText, ChevronDown, ChevronUp, Edit3, Save, X, Plus, Trash2 } from 'lucide-react'

interface DayPlan {
  day: number
  title: string
  details: string
}

export default function CustomerCustomTourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tourRequest, setTourRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null)
  const [showItinerary, setShowItinerary] = useState(true)

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editStartCity, setEditStartCity] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editTotalDays, setEditTotalDays] = useState(3)
  const [editPassengers, setEditPassengers] = useState(2)
  const [editPreferredCab, setEditPreferredCab] = useState('SUV')
  const [editSpecialNotes, setEditSpecialNotes] = useState('')
  const [editDayPlans, setEditDayPlans] = useState<DayPlan[]>([])
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchTourDetails = async () => {
    try {
      const res = await fetch(`/api/custom-tours/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load custom tour request')
      setTourRequest(data.tourRequest)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTourDetails()
  }, [id])

  const handleStartEdit = () => {
    if (!tourRequest) return
    setEditTitle(tourRequest.title || '')
    setEditStartCity(tourRequest.startCity || '')
    setEditStartDate(tourRequest.startDate ? new Date(tourRequest.startDate).toISOString().split('T')[0] : '')
    setEditTotalDays(tourRequest.totalDays || 3)
    setEditPassengers(tourRequest.passengers || 2)
    setEditPreferredCab(tourRequest.preferredCab || 'ANY')
    setEditSpecialNotes(tourRequest.specialNotes || '')

    let parsed: DayPlan[] = []
    try {
      parsed = typeof tourRequest.dayItinerary === 'string'
        ? JSON.parse(tourRequest.dayItinerary)
        : tourRequest.dayItinerary
    } catch {
      parsed = [{ day: 1, title: 'Day 1: Sightseeing', details: tourRequest.dayItinerary || '' }]
    }
    setEditDayPlans(parsed || [])
    setIsEditing(true)
  }

  const handleTotalDaysChange = (newCount: number) => {
    const days = Math.max(1, Math.min(15, newCount))
    setEditTotalDays(days)

    if (days > editDayPlans.length) {
      const added: DayPlan[] = []
      for (let i = editDayPlans.length + 1; i <= days; i++) {
        added.push({
          day: i,
          title: `Day ${i}: Sightseeing & Travel`,
          details: `Write down touring details and cab requirements for Day ${i}...`
        })
      }
      setEditDayPlans([...editDayPlans, ...added])
    } else if (days < editDayPlans.length) {
      setEditDayPlans(editDayPlans.slice(0, days))
    }
  }

  const updateDayPlan = (index: number, field: 'title' | 'details', value: string) => {
    const updated = [...editDayPlans]
    updated[index][field] = value
    setEditDayPlans(updated)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingEdit(true)

    try {
      const res = await fetch(`/api/custom-tours/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          startCity: editStartCity,
          startDate: editStartDate,
          totalDays: editTotalDays,
          passengers: editPassengers,
          preferredCab: editPreferredCab,
          dayItinerary: editDayPlans,
          specialNotes: editSpecialNotes
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update tour request')

      setIsEditing(false)
      fetchTourDetails()
    } catch (err: any) {
      alert(err.message || 'Failed to save updates')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to accept this driver quote and confirm your booking?')) return

    setAcceptingQuoteId(quoteId)
    try {
      const res = await fetch(`/api/custom-tours/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to accept quote')

      router.push(`/dashboard/booking/${data.booking.bookingId}`)
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote. Please try again.')
      setAcceptingQuoteId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center py-20 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E34234]" />
      </div>
    )
  }

  if (error || !tourRequest) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-16 font-sans">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <p className="text-red-600 font-bold">{error || 'Custom tour request not found'}</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#E34234] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Return to Customer Dashboard
          </Link>
        </div>
      </div>
    )
  }

  let parsedItinerary: any[] = []
  try {
    parsedItinerary = typeof tourRequest.dayItinerary === 'string'
      ? JSON.parse(tourRequest.dayItinerary)
      : tourRequest.dayItinerary
  } catch {
    parsedItinerary = [{ day: 1, title: 'Tour Itinerary', details: tourRequest.dayItinerary }]
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 font-sans">
      <main className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* Back link */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-[#E34234] transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Request Overview Header */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                tourRequest.status === 'ACCEPTED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {tourRequest.status === 'ACCEPTED' ? '✓ Quote Accepted & Booked' : '• Open for Driver Bids'}
              </span>
              <span className="text-xs text-slate-500 font-bold">Request #{tourRequest.id.substring(tourRequest.id.length - 6).toUpperCase()}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {tourRequest.title || `${tourRequest.totalDays}-Day Custom Tour`}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-600 font-medium">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#E34234]" /> Start: <strong className="text-slate-900">{tourRequest.startCity}</strong></span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#E34234]" /> Start Date: <strong className="text-slate-900">{new Date(tourRequest.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#E34234]" /> Duration: <strong className="text-slate-900">{tourRequest.totalDays} Days</strong></span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#E34234]" /> Passengers: <strong className="text-slate-900">{tourRequest.passengers} Seats</strong></span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-center w-full md:w-auto">
              <div className="text-2xl md:text-3xl font-black text-[#E34234]">{tourRequest.quotes?.length || 0}</div>
              <div className="text-[11px] text-slate-600 uppercase font-extrabold tracking-wider mt-0.5">Quotes Received</div>
            </div>

            {tourRequest.status !== 'ACCEPTED' && (
              <button
                onClick={handleStartEdit}
                className="w-full md:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Tour Request
              </button>
            )}
          </div>
        </div>

        {/* Day-by-Day Itinerary Accordion Card */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <button
            onClick={() => setShowItinerary(!showItinerary)}
            className="w-full p-6 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition text-left"
          >
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E34234]" />
              Day-by-Day Itinerary Created by You ({parsedItinerary.length} Days)
            </h2>
            {showItinerary ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showItinerary && (
            <div className="p-6 border-t border-slate-200 space-y-4">
              {parsedItinerary.map((plan: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5">
                  <div className="text-sm font-black text-[#E34234] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-[#E34234] text-xs flex items-center justify-center font-black border border-red-200">
                      D{plan.day || idx + 1}
                    </span>
                    {plan.title || `Day ${idx + 1}`}
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 font-medium pl-8 leading-relaxed">
                    {plan.details}
                  </p>
                </div>
              ))}

              {tourRequest.specialNotes && (
                <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 font-medium">
                  <strong className="text-slate-900 font-extrabold">Special Requirements:</strong> {tourRequest.specialNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* QUOTES SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Car className="w-6 h-6 text-[#E34234]" />
              Driver Quoted Prices & Vehicles ({tourRequest.quotes?.length || 0})
            </h2>
            <span className="text-xs font-bold text-slate-500">Sorted by lowest price quote</span>
          </div>

          {(!tourRequest.quotes || tourRequest.quotes.length === 0) ? (
            <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-3 shadow-xs">
              <Clock className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-black text-slate-900">Awaiting Driver Quotes</h3>
              <p className="text-xs font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                Local drivers are currently reviewing your day-by-day itinerary. Once a driver submits a quote, their price quote and car details will appear here automatically!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tourRequest.quotes.map((quote: any) => {
                const driverUser = quote.driver?.user || {}
                const vehicle = quote.vehicle || quote.driver?.vehicles?.[0] || {}
                const isAccepted = quote.status === 'ACCEPTED'

                return (
                  <div
                    key={quote.id}
                    className={`bg-white border ${
                      isAccepted ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                    } p-6 rounded-3xl shadow-xs transition space-y-4`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      {/* Driver & Vehicle Column */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {vehicle.imageUrl ? (
                            <img src={vehicle.imageUrl} alt={vehicle.model} className="w-full h-full object-cover" />
                          ) : (
                            <Car className="w-8 h-8 text-slate-400" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 text-base md:text-lg">
                              {driverUser.name || 'Himalayan Driver'}
                            </h3>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                              Verified Driver
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                            <span className="text-amber-500 font-extrabold flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9 ★
                            </span>
                            <span>• {quote.driver?.experience || 5}+ Yrs Exp</span>
                            <span>• Phone: {driverUser.phone || 'Available after booking'}</span>
                          </div>

                          {/* Vehicle Badge Specs */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-xl border border-slate-200 font-extrabold">
                              🚘 {vehicle.brand || ''} {vehicle.model || 'Cab Vehicle'} ({vehicle.category || 'SUV'})
                            </span>
                            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-xl border border-slate-200 font-bold">
                              {vehicle.seatingCapacity || 4} Seats
                            </span>
                            {vehicle.acStatus && (
                              <span className="bg-sky-50 text-sky-700 text-xs px-2.5 py-1 rounded-xl border border-sky-200 font-bold">
                                AC Available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price & CTA Column */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                        <div className="text-left md:text-right">
                          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Quoted Total Tour Fare</div>
                          <div className="text-2xl md:text-3xl font-black text-slate-900">
                            ₹{quote.quotedPrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-bold">All Fuel, Allowance & Taxes Included</div>
                        </div>

                        {tourRequest.status === 'ACCEPTED' ? (
                          isAccepted ? (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Booked Quote
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">Other quote accepted</span>
                          )
                        ) : (
                          <button
                            onClick={() => handleAcceptQuote(quote.id)}
                            disabled={acceptingQuoteId === quote.id}
                            className="w-full sm:w-auto px-6 py-3 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md shadow-[#E34234]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                          >
                            {acceptingQuoteId === quote.id ? 'Confirming Booking...' : 'Accept & Book Tour →'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Driver Notes Callout */}
                    {quote.notes && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium flex items-start gap-2">
                        <FileText className="w-4 h-4 text-[#E34234] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 font-extrabold">Driver Message / Notes:</strong> {quote.notes}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* EDIT TOUR REQUEST MODAL */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative text-slate-900 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#E34234]" /> Edit Custom Tour Request
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 hover:text-slate-800 text-sm font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">
                      Tour Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#E34234]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">
                      Pickup / Start City
                    </label>
                    <input
                      type="text"
                      required
                      value={editStartCity}
                      onChange={(e) => setEditStartCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#E34234]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#E34234]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">
                      Total Duration (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={editTotalDays}
                      onChange={(e) => handleTotalDaysChange(parseInt(e.target.value || '1', 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-900 focus:bg-white focus:outline-none focus:border-[#E34234]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">
                      Passengers
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editPassengers}
                      onChange={(e) => setEditPassengers(parseInt(e.target.value || '1', 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#E34234]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">
                      Preferred Cab Type
                    </label>
                    <select
                      value={editPreferredCab}
                      onChange={(e) => setEditPreferredCab(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#E34234]"
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

                {/* Day-by-Day Edit Inputs */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 flex items-center justify-between">
                    <span>Day-by-Day Touring Details ({editDayPlans.length} Days)</span>
                    <button
                      type="button"
                      onClick={() => handleTotalDaysChange(editTotalDays + 1)}
                      className="text-xs text-[#E34234] font-extrabold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Day
                    </button>
                  </h4>

                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {editDayPlans.map((plan, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-red-100 text-[#E34234] text-xs font-black flex items-center justify-center flex-shrink-0">
                            {plan.day}
                          </span>
                          <input
                            type="text"
                            required
                            value={plan.title}
                            onChange={(e) => updateDayPlan(idx, 'title', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-[#E34234]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          required
                          value={plan.details}
                          onChange={(e) => updateDayPlan(idx, 'details', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#E34234]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase">
                    Special Notes / Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={editSpecialNotes}
                    onChange={(e) => setEditSpecialNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#E34234]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl text-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-6 py-2.5 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md shadow-[#E34234]/20 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {savingEdit ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
