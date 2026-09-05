"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Car, IndianRupee, Clock, ChevronRight, Loader2, Star, CheckCircle2, FileText, Sparkles, Edit3, ArrowRight } from 'lucide-react'

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  CONFIRMED: 'bg-red-100 text-red-800 border border-red-200',
  DRIVER_ASSIGNED: 'bg-red-100 text-red-800 border border-red-200',
  DRIVER_ARRIVING: 'bg-red-100 text-red-800 border border-red-200',
  TRIP_STARTED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border border-red-200',
  REFUNDED: 'bg-slate-100 text-slate-800 border border-slate-200',
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [customTours, setCustomTours] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null)
  const router = useRouter()

  const fetchDashboardData = () => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/custom-tours').then(r => r.json())
    ]).then(([authData, bookingData, customTourData]) => {
      if (!authData.user) { router.push('/login'); return }
      setUser(authData.user)
      setBookings(bookingData.bookings || [])
      setCustomTours(customTourData.requests || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchDashboardData()
  }, [router])

  const handleAcceptQuote = async (tourId: string, quoteId: string) => {
    if (!confirm('Are you sure you want to accept this driver quote and confirm your booking?')) return

    setAcceptingQuoteId(quoteId)
    try {
      const res = await fetch(`/api/custom-tours/${tourId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to accept quote')

      router.push(`/dashboard/booking/${data.booking.bookingId}`)
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote')
      setAcceptingQuoteId(null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>
  if (!user) return null

  const upcoming = bookings.filter(b => ['PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'TRIP_STARTED'].includes(b.status))
  const past = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(b.status))
  const totalSpent = bookings.filter(b => b.status === 'COMPLETED').reduce((s: number, b: any) => s + b.totalFare, 0)

  return (
    <div className="bg-slate-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        {/* Header */}
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#E34234]">Traveler Dashboard</span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">Welcome back, {user.name}!</h1>
          <p className="text-slate-500 font-semibold text-sm">Manage your upcoming mountain trips, custom tours, and driver quotes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-100"><Car className="w-5 h-5 text-[#E34234]" /></div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Total Trips</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100"><Clock className="w-5 h-5 text-amber-600" /></div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Upcoming</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{upcoming.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100"><IndianRupee className="w-5 h-5 text-emerald-600" /></div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Total Spent</span>
            </div>
            <p className="text-3xl font-black text-slate-900">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Listed Custom Multi-Day Tour Requests & Driver Quotes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">My Custom Tour Requests ({customTours.length})</h2>
              <p className="text-xs font-medium text-slate-500">Driver price quotes bidded against your custom multi-day tour itineraries</p>
            </div>
            <Link href="/custom-tour/new" className="px-4 py-2 bg-[#E34234] hover:bg-[#c93225] text-white text-xs font-extrabold rounded-xl shadow-xs transition flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Post New Tour Request
            </Link>
          </div>

          {customTours.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="text-left space-y-1">
                <p className="text-slate-900 font-black text-base">Planning a Multi-Day Himalayan Tour?</p>
                <p className="text-slate-600 text-xs font-medium leading-relaxed">
                  List your day-by-day touring plan (Day 1, Day 2...) and local verified drivers will bid competitive price quotes for your journey!
                </p>
              </div>
              <Link href="/custom-tour/new" className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-2xl transition-all text-xs flex-shrink-0">
                Build Custom Tour Request →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {customTours.map((ct: any) => {
                const quotesList = ct.quotes || []
                const isAccepted = ct.status === 'ACCEPTED'

                return (
                  <div key={ct.id} className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xs space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isAccepted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {isAccepted ? '✓ Quote Accepted & Booked' : '• Open for Driver Bids'}
                          </span>
                          <span className="text-xs text-slate-500 font-extrabold">{ct.totalDays} Days Tour</span>
                          <span className="text-xs text-slate-500 font-medium">• Start: <strong className="text-slate-900">{ct.startCity}</strong></span>
                        </div>

                        <h3 className="font-black text-xl text-slate-900">{ct.title}</h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                          <span>📅 Start Date: <strong className="text-slate-900">{new Date(ct.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                          <span>👥 Passengers: <strong className="text-slate-900">{ct.passengers} Seats</strong></span>
                          <span>🚘 Preferred: <strong className="text-slate-900">{ct.preferredCab}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 px-4 py-2 rounded-2xl border border-red-100 text-center">
                          <span className="text-xl font-black text-[#E34234]">{quotesList.length}</span>
                          <span className="text-[10px] text-slate-600 font-extrabold uppercase block">Quotes</span>
                        </div>
                        <Link
                          href={`/dashboard/custom-tours/${ct.id}`}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-600" /> Full Itinerary & Details
                        </Link>
                      </div>
                    </div>

                    {/* DRIVER QUOTES BIDS DISPLAY */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Car className="w-4 h-4 text-[#E34234]" />
                          Driver Bidded Price Quotes ({quotesList.length})
                        </h4>
                        {quotesList.length > 0 && (
                          <span className="text-[11px] font-semibold text-slate-500">Sorted by lowest price quote</span>
                        )}
                      </div>

                      {quotesList.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center space-y-2">
                          <Clock className="w-6 h-6 text-amber-500 mx-auto animate-pulse" />
                          <p className="text-xs font-extrabold text-slate-800">Awaiting Driver Bids</p>
                          <p className="text-[11px] font-medium text-slate-500">Verified mountain drivers are inspecting your itinerary. Submitted price quotes will appear here automatically!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {quotesList.map((quote: any) => {
                            const driverUser = quote.driver?.user || {}
                            const vehicle = quote.vehicle || quote.driver?.vehicles?.[0] || {}
                            const isThisQuoteAccepted = quote.status === 'ACCEPTED'

                            return (
                              <div
                                key={quote.id}
                                className={`p-4 rounded-2xl border ${
                                  isThisQuoteAccepted ? 'bg-emerald-50/80 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                } space-y-3 transition`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-slate-900 text-sm">{driverUser.name || 'Himalayan Driver'}</span>
                                      <span className="text-amber-500 font-extrabold text-xs flex items-center gap-0.5">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9
                                      </span>
                                    </div>
                                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                                      🚘 {vehicle.brand} {vehicle.model} ({vehicle.category || 'SUV'}) • {vehicle.seatingCapacity || 4} Seats
                                    </p>
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    <div className="text-xs font-extrabold text-slate-500 uppercase">Quoted Price</div>
                                    <div className="text-xl font-black text-slate-900">₹{quote.quotedPrice.toLocaleString('en-IN')}</div>
                                  </div>
                                </div>

                                {quote.notes && (
                                  <p className="text-[11px] font-medium text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 leading-snug">
                                    &quot;{quote.notes}&quot;
                                  </p>
                                )}

                                <div className="pt-1 flex items-center justify-between border-t border-slate-200/80">
                                  <span className="text-[10px] text-emerald-700 font-bold">Includes fuel, tolls & driver fee</span>

                                  {isAccepted ? (
                                    isThisQuoteAccepted ? (
                                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted & Booked
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-semibold text-slate-400">Not selected</span>
                                    )
                                  ) : (
                                    <button
                                      onClick={() => handleAcceptQuote(ct.id, quote.id)}
                                      disabled={acceptingQuoteId === quote.id}
                                      className="px-4 py-1.5 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                                    >
                                      {acceptingQuoteId === quote.id ? 'Booking...' : 'Accept Quote →'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming Trips */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Upcoming Trips</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xs">
              <p className="text-slate-500 font-medium mb-4">No upcoming trips booked yet.</p>
              <Link href="/" className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-2.5 rounded-xl transition-colors inline-block text-sm shadow-md shadow-[#E34234]/20">Book a Cab Now</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b: any) => (
                <Link key={b.id} href={`/dashboard/booking/${b.bookingId}`}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-red-200 hover:shadow-md transition-all flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-red-100">
                    <MapPin className="w-6 h-6 text-[#E34234]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 text-base truncate">{b.route?.origin} → {b.route?.destination}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" />{new Date(b.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>{b.vehicle?.brand} {b.vehicle?.model}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusColor[b.status] || 'bg-slate-100 text-slate-600'}`}>{b.status.replace(/_/g, ' ')}</span>
                    <p className="text-lg font-black text-slate-900 mt-1">₹{b.totalFare.toLocaleString('en-IN')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#E34234] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Past Trips */}
        <div>
          <h2 className="text-xl font-black text-slate-900 mb-4">Trip History</h2>
          {past.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xs">
              <p className="text-slate-500 font-medium">No past trips recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {past.map((b: any) => (
                <Link key={b.id} href={`/dashboard/booking/${b.bookingId}`}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:shadow-xs transition-all flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{b.route?.origin} → {b.route?.destination}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{new Date(b.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusColor[b.status]}`}>{b.status}</span>
                    <p className="text-lg font-black text-slate-900 mt-1">₹{b.totalFare.toLocaleString('en-IN')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#E34234] flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
