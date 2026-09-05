'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Car, Sparkles, CheckCircle2, Clock, Star, FileText, ChevronDown, ChevronUp, ArrowRight, Search, IndianRupee, ShieldCheck, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'

export default function PublicCustomToursPage() {
  const router = useRouter()
  const [tourRequests, setTourRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null)

  // Selected tour for full Modal inspection
  const [selectedTour, setSelectedTour] = useState<any | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<'quotes' | 'itinerary'>('quotes')
  const [quoteSortOrder, setQuoteSortOrder] = useState<'price_asc' | 'price_desc' | 'rating_desc'>('price_asc')

  const fetchTours = async () => {
    try {
      const [toursRes, userRes] = await Promise.all([
        fetch('/api/custom-tours/public'),
        fetch('/api/auth/me').catch(() => null)
      ])
      const toursData = await toursRes.json()
      setTourRequests(toursData.tourRequests || [])

      if (userRes && userRes.ok) {
        const userData = await userRes.json()
        setCurrentUser(userData.user || null)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTours()
  }, [])

  const handleAcceptQuote = async (tourId: string, quoteId: string) => {
    if (!currentUser) {
      router.push(`/login?redirect=/dashboard/custom-tours/${tourId}`)
      return
    }

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

  const filteredRequests = tourRequests.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.startCity?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center py-20 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E34234]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 font-sans">
      <main className="container mx-auto px-4 max-w-6xl space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b-4 border-[#E34234] text-white p-8 md:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#E34234]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 border border-red-500/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" /> Bidding Marketplace & Itineraries
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Custom Tour Requests & Driver Quotes
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
              Explore multi-day Himalayan tour requests created by travelers. Click any tour card to view all driver price quotes and inspect detailed day-by-day itineraries!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 flex-shrink-0">
            <Link
              href="/custom-tour/new"
              className="px-6 py-3.5 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md shadow-[#E34234]/20 flex items-center justify-center gap-2 transition"
            >
              + Post Custom Tour Request
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by city or title (e.g. Gangtok, Sikkim)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E34234]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-[#E34234]"
            >
              <option value="ALL">All Statuses ({tourRequests.length})</option>
              <option value="OPEN">Open for Driver Bids</option>
              <option value="ACCEPTED">Quote Accepted & Booked</option>
            </select>
          </div>
        </div>

        {/* LISTED CUSTOM TOURS GRID */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-3 shadow-xs">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">No Custom Tours Match Your Filter</h3>
            <p className="text-xs font-medium text-slate-500 max-w-md mx-auto">
              Try resetting your search query or create a new multi-day custom tour request!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRequests.map((item) => {
              const quotesList = item.quotes || []
              const isAccepted = item.status === 'ACCEPTED'

              // Find lowest quoted price if quotes exist
              const sortedQuotes = [...quotesList].sort((a, b) => a.quotedPrice - b.quotedPrice)
              const lowestQuote = sortedQuotes[0]
              const highestQuote = sortedQuotes[sortedQuotes.length - 1]

              let dayList: any[] = []
              try {
                dayList = typeof item.dayItinerary === 'string' ? JSON.parse(item.dayItinerary) : item.dayItinerary
              } catch {
                dayList = [{ day: 1, title: 'Tour Itinerary', details: item.dayItinerary }]
              }

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 hover:border-red-300/80 p-6 md:p-7 rounded-3xl shadow-xs space-y-5 transition duration-200 relative group"
                >
                  {/* Top Badges & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        isAccepted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isAccepted ? '✓ Quote Accepted' : '• Open for Driver Bids'}
                      </span>
                      <span className="text-xs font-black bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                        {item.totalDays} Days ({dayList.length} Days Itinerary)
                      </span>
                      {item.preferredCab && (
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          Cab Pref: {item.preferredCab}
                        </span>
                      )}
                    </div>

                    {/* Price Range Pill */}
                    {lowestQuote ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-1.5 rounded-2xl">
                        <span className="text-[10px] uppercase font-black text-emerald-700 tracking-wider">Starting From</span>
                        <span className="text-lg font-black text-emerald-800">₹{lowestQuote.quotedPrice.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        Awaiting Bids
                      </span>
                    )}
                  </div>

                  {/* Tour Main Summary Title & Metadata */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-[#E34234] transition-colors">
                        {item.title || `${item.totalDays}-Day Tour from ${item.startCity}`}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                        <span>📍 Pickup: <strong className="text-slate-900">{item.startCity}</strong></span>
                        <span>📅 Start: <strong className="text-slate-900">{new Date(item.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                        <span>👥 Passengers: <strong className="text-slate-900">{item.passengers} Seats</strong></span>
                        <span>👤 Traveler: <strong className="text-slate-900">{item.customer?.name || 'Customer'}</strong></span>
                      </div>
                    </div>

                    {/* Driver Quotes Count Card */}
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-center flex-shrink-0">
                        <div className="text-xl font-black text-[#E34234]">{quotesList.length}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Driver Bids</div>
                      </div>
                    </div>
                  </div>

                  {/* Lowest Quote Quick Preview Banner */}
                  {lowestQuote && (
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center border border-emerald-200 flex-shrink-0">
                          ⚡
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900">Lowest Quote: </span>
                          <span className="font-semibold text-slate-700">
                            ₹{lowestQuote.quotedPrice.toLocaleString('en-IN')} by {lowestQuote.driver?.user?.name || 'Driver'} ({lowestQuote.vehicle?.brand || 'Cab'} {lowestQuote.vehicle?.model || ''})
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedTour(item)
                          setActiveModalTab('quotes')
                        }}
                        className="text-xs font-extrabold text-[#E34234] hover:underline flex items-center gap-1 flex-shrink-0"
                      >
                        Compare All {quotesList.length} Quotes →
                      </button>
                    </div>
                  )}

                  {/* Footer Action Button */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setSelectedTour(item)
                        setActiveModalTab('itinerary')
                      }}
                      className="text-xs font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-[#E34234]" /> View Day-by-Day Itinerary ({dayList.length} Days)
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTour(item)
                        setActiveModalTab('quotes')
                      }}
                      className="px-5 py-2.5 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                    >
                      <span>View All Driver Quotes ({quotesList.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* DRIVER QUOTES & ITINERARY OVERLAY MODAL */}
        {selectedTour && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-start justify-between gap-4 flex-shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                      {selectedTour.totalDays} Days Tour
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      📍 {selectedTour.startCity}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white">
                    {selectedTour.title || `${selectedTour.totalDays}-Day Tour from ${selectedTour.startCity}`}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    Start Date: {new Date(selectedTour.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {selectedTour.passengers} Passengers • Listed by {selectedTour.customer?.name || 'Customer'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTour(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Navigation Tabs */}
              <div className="bg-slate-50 px-6 pt-3 border-b border-slate-200 flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalTab('quotes')}
                    className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center gap-2 ${
                      activeModalTab === 'quotes'
                        ? 'border-[#E34234] text-[#E34234]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    Driver Price Quotes ({selectedTour.quotes?.length || 0})
                  </button>

                  <button
                    onClick={() => setActiveModalTab('itinerary')}
                    className={`px-4 py-2.5 text-xs font-black border-b-2 transition flex items-center gap-2 ${
                      activeModalTab === 'itinerary'
                        ? 'border-[#E34234] text-[#E34234]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Day-by-Day Itinerary
                  </button>
                </div>

                {activeModalTab === 'quotes' && selectedTour.quotes?.length > 1 && (
                  <div className="flex items-center gap-1.5 pb-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={quoteSortOrder}
                      onChange={(e: any) => setQuoteSortOrder(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-800 font-extrabold text-[11px] px-2.5 py-1 rounded-lg focus:outline-none focus:border-[#E34234]"
                    >
                      <option value="price_asc">Lowest Price First</option>
                      <option value="price_desc">Highest Price First</option>
                      <option value="rating_desc">Highest Rating First</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Modal Body Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {activeModalTab === 'quotes' ? (
                  <div>
                    {(!selectedTour.quotes || selectedTour.quotes.length === 0) ? (
                      <div className="bg-slate-50 border border-slate-200 p-10 rounded-2xl text-center space-y-2">
                        <Clock className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
                        <h4 className="text-sm font-black text-slate-900">No Driver Quotes Yet</h4>
                        <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                          Local verified mountain drivers are reviewing this tour request. Price quotes will appear here as soon as drivers submit their bids.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[...selectedTour.quotes]
                          .sort((a, b) => {
                            if (quoteSortOrder === 'price_asc') return a.quotedPrice - b.quotedPrice
                            if (quoteSortOrder === 'price_desc') return b.quotedPrice - a.quotedPrice
                            return 0
                          })
                          .map((quote: any, idx: number) => {
                            const driverUser = quote.driver?.user || {}
                            const vehicle = quote.vehicle || quote.driver?.vehicles?.[0] || {}
                            const isThisAccepted = quote.status === 'ACCEPTED'
                            const isTourAccepted = selectedTour.status === 'ACCEPTED'

                            return (
                              <div
                                key={quote.id}
                                className={`p-5 rounded-2xl border ${
                                  isThisAccepted ? 'bg-emerald-50/90 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                } space-y-4 transition`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-slate-900 text-base">{driverUser.name || 'Himalayan Driver'}</span>
                                      <span className="bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9
                                      </span>
                                      {idx === 0 && quoteSortOrder === 'price_asc' && (
                                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                          ⚡ Best Price
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-700">
                                      🚘 {vehicle.brand} {vehicle.model} ({vehicle.category || 'SUV'}) • {vehicle.seatingCapacity || 4} Seats • AC
                                    </p>
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    <div className="text-[10px] font-extrabold text-slate-500 uppercase">Quoted Total Fare</div>
                                    <div className="text-2xl font-black text-slate-900">₹{quote.quotedPrice.toLocaleString('en-IN')}</div>
                                  </div>
                                </div>

                                {quote.notes && (
                                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
                                    <strong className="text-slate-900 font-bold">Driver Message:</strong> &quot;{quote.notes}&quot;
                                  </div>
                                )}

                                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/80">
                                  <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Includes fuel, toll taxes & driver allowance
                                  </span>

                                  {isTourAccepted ? (
                                    isThisAccepted ? (
                                      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Accepted Quote
                                      </span>
                                    ) : (
                                      <span className="text-xs font-semibold text-slate-400">Other quote accepted</span>
                                    )
                                  ) : (
                                    <button
                                      onClick={() => handleAcceptQuote(selectedTour.id, quote.id)}
                                      disabled={acceptingQuoteId === quote.id}
                                      className="px-5 py-2 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                                    >
                                      {acceptingQuoteId === quote.id ? 'Confirming Booking...' : 'Accept & Book Quote →'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ITINERARY TAB */
                  <div className="space-y-4">
                    {(() => {
                      let dayList: any[] = []
                      try {
                        dayList = typeof selectedTour.dayItinerary === 'string' ? JSON.parse(selectedTour.dayItinerary) : selectedTour.dayItinerary
                      } catch {
                        dayList = [{ day: 1, title: 'Tour Itinerary', details: selectedTour.dayItinerary }]
                      }

                      return (
                        <div className="space-y-3">
                          {dayList.map((dayItem: any, dIdx: number) => (
                            <div key={dIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5">
                              <div className="text-xs font-black text-[#E34234] flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-red-100 text-[#E34234] text-xs flex items-center justify-center font-black border border-red-200">
                                  D{dayItem.day || dIdx + 1}
                                </span>
                                {dayItem.title || `Day ${dIdx + 1}`}
                              </div>
                              <p className="text-xs text-slate-700 font-medium pl-8 leading-relaxed">
                                {dayItem.details}
                              </p>
                            </div>
                          ))}

                          {selectedTour.specialNotes && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium">
                              <strong className="font-extrabold text-amber-950">Traveler Special Notes:</strong> {selectedTour.specialNotes}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-right flex-shrink-0">
                <button
                  onClick={() => setSelectedTour(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs rounded-xl transition"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  )
}
