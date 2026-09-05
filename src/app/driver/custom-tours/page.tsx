'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Car, Sparkles, CheckCircle2, Clock, Send, ShieldCheck, ChevronDown, ChevronUp, FileText, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'

export default function DriverCustomToursMarketplacePage() {
  const [openRequests, setOpenRequests] = useState<any[]>([])
  const [driverVehicles, setDriverVehicles] = useState<any[]>([])
  const [driverId, setDriverId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Bidding form modal state
  const [activeRequest, setActiveRequest] = useState<any>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [quotedPrice, setQuotedPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)

  const fetchMarketplaceData = async () => {
    try {
      const res = await fetch('/api/driver/custom-tours')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load custom tour marketplace')
      setOpenRequests(data.openRequests || [])
      setDriverVehicles(data.driverVehicles || [])
      setDriverId(data.driverId || '')
      if (data.driverVehicles?.length > 0) {
        setSelectedVehicleId(data.driverVehicles[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketplaceData()
  }, [])

  const handleOpenQuoteModal = (reqItem: any) => {
    setActiveRequest(reqItem)
    setSubmitMessage('')
    // Check if driver has existing quote
    const existingQuote = reqItem.quotes?.find((q: any) => q.driverId === driverId)
    if (existingQuote) {
      setQuotedPrice(existingQuote.quotedPrice.toString())
      setNotes(existingQuote.notes || '')
      if (existingQuote.vehicleId) setSelectedVehicleId(existingQuote.vehicleId)
    } else {
      setQuotedPrice('')
      setNotes('')
    }
  }

  const handleSubmiQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRequest || !quotedPrice) return

    setSubmitting(true)
    setSubmitMessage('')

    try {
      const res = await fetch(`/api/driver/custom-tours/${activeRequest.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          quotedPrice,
          notes
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit quote')

      setSubmitMessage('Quote submitted successfully!')
      fetchMarketplaceData()
      setTimeout(() => {
        setActiveRequest(null)
      }, 1500)
    } catch (err: any) {
      alert(err.message || 'Failed to submit quote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center py-20 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E34234]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-slate-900 font-sans">
      <main className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* Back link */}
        <div className="flex items-center justify-between">
          <Link href="/driver/listings" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-[#E34234] transition">
            <ArrowLeft className="w-4 h-4" /> Back to Driver Rides & Sightseeing
          </Link>

          <button
            onClick={fetchMarketplaceData}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#E34234]" /> Refresh Bids
          </button>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b-4 border-[#E34234] text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" /> Driver Custom Tour Bidding
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Customer Tour Requests ({openRequests.length})
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Inspect customer day-by-day touring itineraries and quote your price. If a customer updates their itinerary, you can adjust your quoted fare anytime!
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center flex-shrink-0">
            <div className="text-2xl font-black text-white">{openRequests.length}</div>
            <div className="text-[11px] text-slate-400 uppercase font-extrabold">Active Tour Requests</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {/* List of Open Requests */}
        {openRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-3 shadow-xs">
            <Clock className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">No Open Tour Requests Right Now</h3>
            <p className="text-xs font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
              When customers list new multi-day custom tours, they will show up here for you to bid on!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {openRequests.map((item) => {
              let dayList: any[] = []
              try {
                dayList = typeof item.dayItinerary === 'string' ? JSON.parse(item.dayItinerary) : item.dayItinerary
              } catch {
                dayList = [{ day: 1, title: 'Tour Itinerary', details: item.dayItinerary }]
              }

              const myQuote = item.quotes?.[0]
              const isExpanded = expandedRequestId === item.id
              const isUpdatedByCustomer = new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime() > 1000

              return (
                <div key={item.id} className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-xs space-y-6">
                  {/* Item Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                          {item.totalDays} Days Tour
                        </span>
                        {isUpdatedByCustomer && (
                          <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> Updated by Customer
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-semibold">
                          Start Date: <strong className="text-slate-900">{new Date(item.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                        </span>
                        {item.preferredCab && (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200">
                            Prefers: {item.preferredCab}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl md:text-2xl font-black text-slate-900">
                        {item.title || `${item.totalDays}-Day Tour from ${item.startCity}`}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                        <span>📍 Pickup: <strong className="text-slate-900">{item.startCity}</strong></span>
                        <span>👥 Passengers: <strong className="text-slate-900">{item.passengers} Seats</strong></span>
                        <span>👤 Customer: <strong className="text-slate-900">{item.customer?.name || 'Customer'}</strong></span>
                      </div>
                    </div>

                    {/* Action Quote Button / Status */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3">
                      {myQuote ? (
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                            ✓ You Quoted: ₹{myQuote.quotedPrice.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleOpenQuoteModal(item)}
                            className="block mt-2 text-xs text-[#E34234] hover:underline font-extrabold"
                          >
                            Update Your Quote
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenQuoteModal(item)}
                          className="px-6 py-3 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md shadow-[#E34234]/20 flex items-center gap-2 transition"
                        >
                          <Send className="w-4 h-4" /> Quote Your Price
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Day-by-Day Itinerary Inspector */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setExpandedRequestId(isExpanded ? null : item.id)}
                      className="text-xs font-extrabold text-slate-700 hover:text-[#E34234] flex items-center gap-2 transition"
                    >
                      <FileText className="w-4 h-4 text-[#E34234]" />
                      {isExpanded ? 'Hide Day-by-Day Itinerary' : `Inspect Full Day-by-Day Itinerary (${dayList.length} Days)`}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                        {dayList.map((dayItem: any, dIdx: number) => (
                          <div key={dIdx} className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1">
                            <div className="text-xs font-black text-[#E34234] flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-red-100 text-[#E34234] text-[10px] flex items-center justify-center font-black border border-red-200">
                                D{dayItem.day || dIdx + 1}
                              </span>
                              {dayItem.title || `Day ${dIdx + 1}`}
                            </div>
                            <p className="text-xs text-slate-700 font-medium pl-7 leading-relaxed">
                              {dayItem.details}
                            </p>
                          </div>
                        ))}

                        {item.specialNotes && (
                          <div className="pt-2 text-xs text-slate-600 border-t border-slate-200">
                            <strong className="text-slate-900 font-extrabold">Customer Special Notes:</strong> {item.specialNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* QUOTE BIDDING MODAL */}
        {activeRequest && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#E34234]" /> Quote Your Price for Tour
                </h3>
                <button
                  onClick={() => setActiveRequest(null)}
                  className="text-slate-400 hover:text-slate-800 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1 border border-slate-200">
                <div className="text-sm font-black text-slate-900">{activeRequest.title}</div>
                <div className="text-slate-600 font-medium">📍 Start: {activeRequest.startCity} | 📅 Duration: {activeRequest.totalDays} Days</div>
              </div>

              {submitMessage ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {submitMessage}
                </div>
              ) : (
                <form onSubmit={handleSubmiQuote} className="space-y-5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                      Select Vehicle from Your Fleet
                    </label>
                    <select
                      required
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                    >
                      {driverVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} ({v.category} - {v.seatingCapacity} Seats)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                      Your Quoted Total Tour Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        min={500}
                        placeholder="e.g. 14500"
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-3 text-slate-900 text-sm font-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                      Include fuel, driver allowance, hill charges, and tolls in your quoted total price.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                      Driver Notes / Vehicle Facilities
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Clean Innova Crysta, experienced hill driver, includes all tolls & fuel..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs md:text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E34234]/20 focus:border-[#E34234] transition"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveRequest(null)}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl text-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold text-xs md:text-sm rounded-xl shadow-md shadow-[#E34234]/20 flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting Quote...' : 'Submit Price Quote →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
