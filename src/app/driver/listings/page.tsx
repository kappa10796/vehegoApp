"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Car, Plus, MapPin, Calendar, Clock, IndianRupee, Sparkles, Trash2, ArrowLeft,
  CheckCircle2, AlertCircle, Loader2, Compass, ShieldCheck, TrendingUp, Tag, Check, CalendarDays, Edit3, Save, Search, RefreshCw, X, ShieldAlert
} from 'lucide-react'

export const TIME_BANDWIDTH_SLOTS = [
  { slot: '05:00-06:00', label: '05:00 AM - 06:00 AM', tag: 'Early Dawn' },
  { slot: '06:00-07:00', label: '06:00 AM - 07:00 AM', tag: 'Early Morning' },
  { slot: '07:00-08:00', label: '07:00 AM - 08:00 AM', tag: 'Morning Departure' },
  { slot: '08:00-09:00', label: '08:00 AM - 09:00 AM', tag: 'Morning Peak' },
  { slot: '09:00-10:00', label: '09:00 AM - 10:00 AM', tag: 'Popular Morning' },
  { slot: '10:00-11:00', label: '10:00 AM - 11:00 AM', tag: 'Late Morning' },
  { slot: '11:00-12:00', label: '11:00 AM - 12:00 PM', tag: 'Midday' },
  { slot: '12:00-13:00', label: '12:00 PM - 01:00 PM', tag: 'Lunch Slot' },
  { slot: '13:00-14:00', label: '01:00 PM - 02:00 PM', tag: 'Early Afternoon' },
  { slot: '14:00-15:00', label: '02:00 PM - 03:00 PM', tag: 'Afternoon' },
  { slot: '15:00-16:00', label: '03:00 PM - 04:00 PM', tag: 'Late Afternoon' },
  { slot: '16:00-17:00', label: '04:00 PM - 05:00 PM', tag: 'Evening' },
  { slot: '17:00-18:00', label: '05:00 PM - 06:00 PM', tag: 'Evening Peak' },
  { slot: '18:00-19:00', label: '06:00 PM - 07:00 PM', tag: 'Dusk Departure' },
  { slot: '19:00-20:00', label: '07:00 PM - 08:00 PM', tag: 'Early Night' },
  { slot: '20:00-21:00', label: '08:00 PM - 09:00 PM', tag: 'Night Taxi' },
  { slot: '21:00-22:00', label: '09:00 PM - 10:00 PM', tag: 'Late Night Hill' },
  { slot: '22:00-23:00', label: '10:00 PM - 11:00 PM', tag: 'Midnight' }
]

export default function DriverListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Filter & Search State
  const [filterType, setFilterType] = useState<'ALL' | 'ROUTE_RIDE' | 'SIGHTSEEING'>('ALL')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterSpecificDate, setFilterSpecificDate] = useState('')

  // Create Form State
  const [type, setType] = useState<'ROUTE_RIDE' | 'SIGHTSEEING'>('ROUTE_RIDE')
  const [title, setTitle] = useState('')
  const [origin, setOrigin] = useState('Siliguri')
  const [destination, setDestination] = useState('Gangtok')
  const [itineraryInput, setItineraryInput] = useState('Tiger Hill, Batasia Loop, Ghoom Monastery')
  const [duration, setDuration] = useState('4 Hours')
  const [availableSeats, setAvailableSeats] = useState(4)

  // Multi-Date Availability State
  const [dateMode, setDateMode] = useState<'SINGLE' | 'MULTIPLE' | 'RANGE'>('SINGLE')
  const [singleDate, setSingleDate] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')

  const [customPrice, setCustomPrice] = useState<number | string>('')
  const [notes, setNotes] = useState('')

  // 1-Hour Bandwidth Pickup Time Slot Pricing State
  const [slotPrices, setSlotPrices] = useState<{ slot: string; label: string; price: number }[]>([])
  const [selectedSlotInput, setSelectedSlotInput] = useState('09:00-10:00')
  const [slotPriceInput, setSlotPriceInput] = useState<number | string>('')

  // Edit Listing State
  const [editingListing, setEditingListing] = useState<any | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editOrigin, setEditOrigin] = useState('')
  const [editDestination, setEditDestination] = useState('')
  const [editCustomPrice, setEditCustomPrice] = useState<number | string>('')
  const [editAvailableSeats, setEditAvailableSeats] = useState(4)
  const [editAvailableDate, setEditAvailableDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editSlotPrices, setEditSlotPrices] = useState<{ slot: string; label: string; price: number }[]>([])
  const [editSelectedSlotInput, setEditSelectedSlotInput] = useState('09:00-10:00')
  const [editSlotPriceInput, setEditSlotPriceInput] = useState<number | string>('')
  const [updating, setUpdating] = useState(false)

  // Price Suggestion State
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null)
  const [suggesting, setSuggesting] = useState(false)
  const [demandLevel, setDemandLevel] = useState<string>('MODERATE')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [driverStatus, setDriverStatus] = useState<string>('APPROVED')

  useEffect(() => {
    fetchListings()
    const tmr = new Date()
    tmr.setDate(tmr.getDate() + 1)
    const tmrStr = tmr.toISOString().split('T')[0]
    setSingleDate(tmrStr)
    setSelectedDates([tmrStr])
    setRangeStart(tmrStr)
    
    const end = new Date(tmr)
    end.setDate(end.getDate() + 3)
    setRangeEnd(end.toISOString().split('T')[0])
  }, [])

  const fetchListings = () => {
    fetch('/api/driver/dashboard')
      .then(res => res.json())
      .then(dashData => {
        if (dashData.driver) {
          setDriverStatus(dashData.driver.status)
          if (dashData.driver.status !== 'APPROVED') {
            setLoading(false)
            return null
          }
        }
        return fetch('/api/driver/listings').then(res => res.json())
      })
      .then(data => {
        if (data?.listings) setListings(data.listings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    if (dateMode === 'SINGLE') {
      if (singleDate) setSelectedDates([singleDate])
    } else if (dateMode === 'RANGE') {
      if (rangeStart && rangeEnd) {
        const start = new Date(rangeStart)
        const end = new Date(rangeEnd)
        const dates: string[] = []
        if (start <= end) {
          const curr = new Date(start)
          while (curr <= end) {
            dates.push(curr.toISOString().split('T')[0])
            curr.setDate(curr.getDate() + 1)
          }
        }
        setSelectedDates(dates)
      }
    }
  }, [dateMode, singleDate, rangeStart, rangeEnd])

  const toggleMultipleDate = (dateStr: string) => {
    setSelectedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort()
    )
  }

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ride offer?')) return
    try {
      const res = await fetch(`/api/driver/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== id))
        setSuccessMsg('Ride offer deleted.')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch {
      alert('Failed to delete listing')
    }
  }

  // Handle adding a 1-hour slot price override for Create Form
  const handleAddSlotPrice = () => {
    if (!slotPriceInput || Number(slotPriceInput) <= 0) return
    const found = TIME_BANDWIDTH_SLOTS.find(s => s.slot === selectedSlotInput)
    if (!found) return

    setSlotPrices(prev => {
      const filtered = prev.filter(p => p.slot !== selectedSlotInput)
      return [...filtered, { slot: found.slot, label: found.label, price: Number(slotPriceInput) }]
    })
    setSlotPriceInput('')
  }

  const handleRemoveSlotPrice = (slotId: string) => {
    setSlotPrices(prev => prev.filter(p => p.slot !== slotId))
  }

  // Handle adding a 1-hour slot price override for Edit Form
  const handleAddEditSlotPrice = () => {
    if (!editSlotPriceInput || Number(editSlotPriceInput) <= 0) return
    const found = TIME_BANDWIDTH_SLOTS.find(s => s.slot === editSelectedSlotInput)
    if (!found) return

    setEditSlotPrices(prev => {
      const filtered = prev.filter(p => p.slot !== editSelectedSlotInput)
      return [...filtered, { slot: found.slot, label: found.label, price: Number(editSlotPriceInput) }]
    })
    setEditSlotPriceInput('')
  }

  const handleRemoveEditSlotPrice = (slotId: string) => {
    setEditSlotPrices(prev => prev.filter(p => p.slot !== slotId))
  }

  useEffect(() => {
    if (!showModal) return
    setSuggesting(true)
    fetch('/api/driver/listings/suggest-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, origin, destination })
    })
      .then(res => res.json())
      .then(data => {
        if (data.suggestedPrice) {
          setSuggestedPrice(data.suggestedPrice)
          setDemandLevel(data.demandLevel)
          if (!customPrice) {
            setCustomPrice(data.suggestedPrice)
          }
        }
        setSuggesting(false)
      })
      .catch(() => setSuggesting(false))
  }, [type, origin, destination, showModal])

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedDates.length === 0) {
      setError('Please select at least one available date.')
      return
    }

    setSubmitting(true)
    const finalTitle = title || (type === 'ROUTE_RIDE' ? `${origin} to ${destination} Direct Ride` : `${destination} Tour Package`)

    try {
      const res = await fetch('/api/driver/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: finalTitle,
          origin: type === 'ROUTE_RIDE' ? origin : undefined,
          destination,
          itinerary: type === 'SIGHTSEEING' ? itineraryInput.split(',').map(s => s.trim()) : undefined,
          duration,
          customPrice: Number(customPrice),
          suggestedPrice: suggestedPrice || Number(customPrice),
          timeSlotPricing: slotPrices,
          availableSeats,
          availableDates: selectedDates,
          notes
        })
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(data.message || `Successfully published for ${selectedDates.length} available date(s)!`)
        setShowModal(false)
        setSlotPrices([])
        fetchListings()
        setTimeout(() => setSuccessMsg(''), 4000)
      } else {
        setError(data.error || 'Failed to create listings')
      }
    } catch {
      setError('Error publishing listings')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (item: any) => {
    setEditingListing(item)
    setEditTitle(item.title || '')
    setEditOrigin(item.origin || 'Siliguri')
    setEditDestination(item.destination || '')
    setEditCustomPrice(item.customPrice || '')
    setEditAvailableSeats(item.availableSeats || 4)
    setEditDuration(item.duration || 'Full Day')
    setEditNotes(item.notes || '')
    if (item.availableDate) {
      const d = new Date(item.availableDate)
      setEditAvailableDate(d.toISOString().split('T')[0])
    }

    try {
      const parsed = typeof item.timeSlotPricing === 'string' ? JSON.parse(item.timeSlotPricing) : item.timeSlotPricing
      setEditSlotPrices(Array.isArray(parsed) ? parsed : [])
    } catch {
      setEditSlotPrices([])
    }

    setShowEditModal(true)
  }

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingListing) return

    setUpdating(true)
    setError('')

    try {
      const res = await fetch(`/api/driver/listings/${editingListing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          origin: editingListing.type === 'ROUTE_RIDE' ? editOrigin : undefined,
          destination: editDestination,
          customPrice: Number(editCustomPrice),
          timeSlotPricing: editSlotPrices,
          availableSeats: Number(editAvailableSeats),
          availableDate: editAvailableDate,
          duration: editDuration,
          notes: editNotes
        })
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessMsg('Listing updated successfully!')
        setShowEditModal(false)
        fetchListings()
        setTimeout(() => setSuccessMsg(''), 4000)
      } else {
        setError(data.error || 'Failed to update listing')
      }
    } catch {
      setError('Error updating listing')
    } finally {
      setUpdating(false)
    }
  }

  const filteredListings = listings.filter(item => {
    if (filterType !== 'ALL' && item.type !== filterType) return false
    if (filterSearch) {
      const q = filterSearch.toLowerCase()
      const titleMatch = item.title?.toLowerCase().includes(q)
      const origMatch = item.origin?.toLowerCase().includes(q)
      const destMatch = item.destination?.toLowerCase().includes(q)
      if (!titleMatch && !origMatch && !destMatch) return false
    }
    if (filterSpecificDate && item.availableDate) {
      const itemD = new Date(item.availableDate).toISOString().split('T')[0]
      if (itemD !== filterSpecificDate) return false
    }
    return true
  })

  const resetFilters = () => {
    setFilterType('ALL')
    setFilterSearch('')
    setFilterSpecificDate('')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>
  }

  if (driverStatus !== 'APPROVED') {
    return (
      <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center px-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-200 shadow-sm">
            <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
            Account Status: {driverStatus}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-4 mb-2">Listing Option Locked</h2>
          <p className="text-slate-600 font-semibold text-sm leading-relaxed mb-6">
            Your driver profile and vehicle credentials are currently under review by the VEHEGO admin team. You cannot publish or manage custom ride listings until your profile is approved.
          </p>
          <Link
            href="/driver/dashboard"
            className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-3 rounded-2xl transition-all inline-flex items-center gap-2 text-sm shadow-md shadow-[#E34234]/30"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Driver Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/driver/dashboard" className="text-slate-500 hover:text-[#E34234] text-xs font-bold flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-extrabold text-[#E34234] uppercase tracking-wider">Dynamic Pricing & Rides</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">Driver Direct Listings</h1>
            <p className="text-slate-500 text-sm font-semibold mt-1">Set custom prices & 1-hour bandwidth pickup time rates directly for your passenger offers.</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-5 py-3 rounded-2xl transition-all flex items-center gap-2 text-sm shadow-md shadow-[#E34234]/20 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" /> Create Multi-Day Ride Offer
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl mb-6 font-extrabold text-sm flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> {successMsg}
          </div>
        )}

        {/* DRIVER LISTINGS FILTER TOOLBAR */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
              <Calendar className="w-4 h-4 text-[#E34234]" />
              <span>Calendar Date & Search Filters</span>
              <span className="bg-red-100 text-[#E34234] px-2.5 py-0.5 rounded-full text-[10px]">
                {filteredListings.length} of {listings.length} Active
              </span>
            </div>

            {(filterType !== 'ALL' || filterSearch !== '' || filterSpecificDate !== '') && (
              <button
                onClick={resetFilters}
                className="text-xs font-extrabold text-[#E34234] hover:underline flex items-center gap-1 transition-colors cursor-pointer bg-red-50 px-3 py-1.5 rounded-xl border border-red-100"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Pick Date from Calendar</label>
              <div className="relative">
                <input
                  type="date"
                  value={filterSpecificDate}
                  onChange={e => setFilterSpecificDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-red-50/70 border-2 border-red-200 rounded-xl text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]"
                />
                {filterSpecificDate && (
                  <button
                    onClick={() => setFilterSpecificDate('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-white rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Search Route / Keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                  placeholder="e.g. Gangtok, Darjeeling..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Offering Category</label>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]"
              >
                <option value="ALL">All Categories</option>
                <option value="ROUTE_RIDE">Point-to-Point Rides</option>
                <option value="SIGHTSEEING">Sightseeing Packages</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Display */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-[#E34234] rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Rides Found For Selected Date</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">No published offers match your selected calendar date ({filterSpecificDate || 'filters'}). Try resetting filters or adding a ride for this date!</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetFilters}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 text-xs shadow-md shadow-[#E34234]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Listing
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredListings.map((item) => {
              let parsedSlotPrices: any[] = []
              try {
                parsedSlotPrices = typeof item.timeSlotPricing === 'string' ? JSON.parse(item.timeSlotPricing) : item.timeSlotPricing || []
              } catch {
                parsedSlotPrices = []
              }

              return (
                <div key={item.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-red-200 transition-all group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        item.type === 'ROUTE_RIDE' ? 'bg-red-50 text-[#E34234] border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {item.type === 'ROUTE_RIDE' ? 'Point-to-Point Ride' : 'Sightseeing Tour'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">ID #{item.id.substring(item.id.length - 6).toUpperCase()}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2">{item.title}</h3>

                    <div className="space-y-2 text-xs font-bold text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {item.origin && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#E34234]" />
                          <span>Route: <strong>{item.origin} → {item.destination}</strong></span>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-[#E34234]"><Calendar className="w-4 h-4" /> Available Date: <strong>{new Date(item.availableDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {item.duration}</span>
                      </div>

                      {/* Display 1-Hour Time Slot Dynamic Pricing Badges if configured */}
                      {Array.isArray(parsedSlotPrices) && parsedSlotPrices.length > 0 && (
                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">1-Hour Pickup Time Slot Dynamic Rates:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {parsedSlotPrices.map((sp: any, idx: number) => (
                              <span key={idx} className="bg-red-50 text-red-900 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                                🕒 {sp.label}: ₹{sp.price?.toLocaleString('en-IN')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.notes && <p className="text-slate-500 font-normal italic pt-1 border-t border-slate-200">{item.notes}</p>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-[#E34234]">₹{item.customPrice.toLocaleString('en-IN')}</span>
                        {item.suggestedPrice && (
                          <span className="text-xs font-extrabold text-slate-400 line-through">₹{item.suggestedPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Base Offered Rate</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1"
                        title="Edit Ride Offer & Time Slot Rates"
                      >
                        <Edit3 className="w-4 h-4 text-slate-600" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* EDIT LISTING MODAL */}
        {showEditModal && editingListing && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Edit Ride Offer</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Modify price, availability date, and 1-hour bandwidth pickup rates.</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-900 font-black text-lg">✕</button>
              </div>

              <form onSubmit={handleUpdateListing} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Listing Title</label>
                  <input
                    type="text" required value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]"
                  />
                </div>

                {editingListing.type === 'ROUTE_RIDE' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Pickup Origin</label>
                      <input type="text" value={editOrigin} onChange={e => setEditOrigin(e.target.value)} className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]" />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Destination</label>
                      <input type="text" value={editDestination} onChange={e => setEditDestination(e.target.value)} className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Available Travel Date</label>
                    <input
                      type="date" required value={editAvailableDate} onChange={e => setEditAvailableDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Seats Available</label>
                    <input
                      type="number" min={1} max={12} value={editAvailableSeats} onChange={e => setEditAvailableSeats(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Your Base Offered Fare (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E34234]" />
                    <input
                      type="number" required value={editCustomPrice} onChange={e => setEditCustomPrice(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#E34234] focus:ring-2 focus:ring-[#E34234] outline-none text-slate-900 font-black text-xl bg-white"
                      placeholder="Enter new fare price"
                    />
                  </div>
                </div>

                {/* EDIT 1-HOUR BANDWIDTH PICKUP TIME SLOT PRICING SECTION */}
                <div className="bg-red-50/80 p-4.5 rounded-2xl border-2 border-red-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-[#E34234] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Pickup Time-Based Multiple Prices
                    </label>
                    <span className="text-[10px] font-black bg-[#E34234] text-white px-2.5 py-0.5 rounded-full">
                      {editSlotPrices.length} Custom Slot Price(s) Set
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                    Set multiple rates for this listing depending on passenger pickup timing (1-hour slots):
                  </p>

                  {/* Inline Side-by-Side Row: Time Selector Box | Price Input Box | Add Button */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="md:col-span-6">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        1. Select Pickup Time Slot
                      </label>
                      <select
                        value={editSelectedSlotInput}
                        onChange={e => setEditSelectedSlotInput(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-900 bg-slate-50 outline-none focus:ring-2 focus:ring-[#E34234]"
                      >
                        {TIME_BANDWIDTH_SLOTS.map(s => (
                          <option key={s.slot} value={s.slot}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        2. Price for this Slot (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#E34234]" />
                        <input
                          type="number"
                          placeholder="e.g. 3800"
                          value={editSlotPriceInput}
                          onChange={e => setEditSlotPriceInput(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-black text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#E34234]"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={handleAddEditSlotPrice}
                        className="w-full bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                      >
                        + Add Rate
                      </button>
                    </div>
                  </div>

                  {/* Display List of Configured Pickup Time Prices */}
                  {editSlotPrices.length > 0 ? (
                    <div className="space-y-1.5 pt-2 border-t border-red-200">
                      <span className="text-[10px] font-black uppercase text-slate-600 block">
                        Active Pickup Time Prices for this Listing:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {editSlotPrices.map((sp, idx) => (
                          <div key={idx} className="bg-white border border-red-200 p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#E34234] flex-shrink-0" />
                              <div>
                                <span className="text-xs font-black text-slate-900 block">{sp.label}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Slot Rate</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[#E34234]">₹{sp.price.toLocaleString('en-IN')}</span>
                              <button type="button" onClick={() => handleRemoveEditSlotPrice(sp.slot)} className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50" title="Remove slot rate">
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No custom time slot rates added yet. Base offered fare will apply to all times.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Duration</label>
                  <input
                    type="text" value={editDuration} onChange={e => setEditDuration(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Driver Notes</label>
                  <textarea
                    rows={2} value={editNotes} onChange={e => setEditNotes(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-600 font-bold px-4 py-2 text-xs">Cancel</button>
                  <button
                    type="submit" disabled={updating}
                    className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-[#E34234]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <> <Save className="w-4 h-4" /> <span>Save Changes</span> </>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE MULTI-DAY LISTING MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">List Ride for Multiple Days</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Publish a single ride details across multiple available dates with 1-hour time slot prices.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 font-black text-lg">✕</button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4 text-xs font-extrabold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleCreateListing} className="space-y-5">
                {/* Offering Type Selector */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Offering Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button" onClick={() => setType('ROUTE_RIDE')}
                      className={`p-3.5 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${
                        type === 'ROUTE_RIDE' ? 'border-[#E34234] bg-red-50 text-[#E34234] shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Car className="w-4 h-4" /> Point-to-Point Transfer
                    </button>
                    <button
                      type="button" onClick={() => setType('SIGHTSEEING')}
                      className={`p-3.5 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 ${
                        type === 'SIGHTSEEING' ? 'border-[#E34234] bg-red-50 text-[#E34234] shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Compass className="w-4 h-4" /> Sightseeing Package
                    </button>
                  </div>
                </div>

                {type === 'ROUTE_RIDE' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Pickup Origin (Source)</label>
                      <select value={origin} onChange={e => setOrigin(e.target.value)} className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 bg-white outline-none">
                        <option value="Siliguri">Siliguri</option>
                        <option value="Bagdogra Airport (IXB)">Bagdogra Airport (IXB)</option>
                        <option value="NJP Railway Station">NJP Railway Station</option>
                        <option value="Darjeeling">Darjeeling</option>
                        <option value="Gangtok">Gangtok</option>
                        <option value="Kalimpong">Kalimpong</option>
                        <option value="Kurseong">Kurseong</option>
                        <option value="Mirik">Mirik</option>
                        <option value="Pelling">Pelling</option>
                        <option value="Pakyong Airport (PYG)">Pakyong Airport (PYG)</option>
                        <option value="Jaigaon (Bhutan Border)">Jaigaon (Bhutan Border)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Destination</label>
                      <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 bg-white outline-none">
                        <option value="Gangtok">Gangtok</option>
                        <option value="Darjeeling">Darjeeling</option>
                        <option value="Kalimpong">Kalimpong</option>
                        <option value="Pelling">Pelling</option>
                        <option value="Ravangla">Ravangla</option>
                        <option value="Namchi (Char Dham)">Namchi (Char Dham)</option>
                        <option value="Lachung / Yumthang">Lachung / Yumthang</option>
                        <option value="Lachen / Gurudongmar">Lachen / Gurudongmar</option>
                        <option value="Mirik">Mirik</option>
                        <option value="Kurseong">Kurseong</option>
                        <option value="Siliguri">Siliguri</option>
                        <option value="Bagdogra Airport (IXB)">Bagdogra Airport (IXB)</option>
                        <option value="NJP Railway Station">NJP Railway Station</option>
                        <option value="Lataguri (Dooars)">Lataguri (Dooars)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Sightseeing Sector Name</label>
                      <input type="text" required value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Darjeeling 7-Points Tour" className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]" />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Key Tour Stops (Comma Separated)</label>
                      <input type="text" value={itineraryInput} onChange={e => setItineraryInput(e.target.value)} placeholder="e.g. Tiger Hill, Batasia Loop, Rock Garden" className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]" />
                    </div>
                  </div>
                )}

                {/* MULTI-DAY AVAILABILITY SELECTION */}
                <div className="bg-red-50/60 p-4.5 rounded-2xl border border-red-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-[#E34234]" /> Available Operating Dates Selection
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#E34234] text-white px-2 py-0.5 rounded-md">
                      {selectedDates.length} Date(s) Selected
                    </span>
                  </div>

                  {/* Mode Tabs */}
                  <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-extrabold">
                    <button
                      type="button" onClick={() => setDateMode('SINGLE')}
                      className={`py-1.5 rounded-lg transition-all ${dateMode === 'SINGLE' ? 'bg-[#E34234] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Single Date
                    </button>
                    <button
                      type="button" onClick={() => setDateMode('MULTIPLE')}
                      className={`py-1.5 rounded-lg transition-all ${dateMode === 'MULTIPLE' ? 'bg-[#E34234] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Pick Multiple Dates
                    </button>
                    <button
                      type="button" onClick={() => setDateMode('RANGE')}
                      className={`py-1.5 rounded-lg transition-all ${dateMode === 'RANGE' ? 'bg-[#E34234] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      Date Range
                    </button>
                  </div>

                  {/* Single Date Picker */}
                  {dateMode === 'SINGLE' && (
                    <div>
                      <input type="date" required value={singleDate} onChange={e => setSingleDate(e.target.value)} className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#E34234]" />
                    </div>
                  )}

                  {/* Date Range Picker */}
                  {dateMode === 'RANGE' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">Start Date</label>
                        <input type="date" required value={rangeStart} onChange={e => setRangeStart(e.target.value)} className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#E34234]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">End Date</label>
                        <input type="date" required value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#E34234]" />
                      </div>
                    </div>
                  )}

                  {/* Multiple Dates Picker Chips */}
                  {dateMode === 'MULTIPLE' && (
                    <div>
                      <p className="text-[11px] text-slate-500 font-semibold mb-2">Click to select/unselect available operating days for this ride:</p>
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(offset => {
                          const d = new Date()
                          d.setDate(d.getDate() + offset + 1)
                          const dateStr = d.toISOString().split('T')[0]
                          const isSelected = selectedDates.includes(dateStr)
                          return (
                            <button
                              key={dateStr} type="button" onClick={() => toggleMultipleDate(dateStr)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-1 ${
                                isSelected ? 'bg-[#E34234] text-white border-[#E34234] shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Dates Badges Summary */}
                  {selectedDates.length > 0 && (
                    <div className="pt-2 border-t border-red-100">
                      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Ride will be active for these available dates:</p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {selectedDates.map(dStr => (
                          <span key={dStr} className="bg-white text-slate-900 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-2xs">
                            {new Date(dStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Seat Capacity</label>
                    <input type="number" min={1} max={12} value={availableSeats} onChange={e => setAvailableSeats(Number(e.target.value))} className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Ride Duration</label>
                    <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 4 Hours / Full Day" className="w-full border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-extrabold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]" />
                  </div>
                </div>

                {/* DYNAMIC PRICE SUGGESTION WIDGET */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl text-white space-y-3 shadow-md border-t-4 border-[#E34234]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#E34234] uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" /> Real-time Market Price Suggestion
                    </div>
                    {demandLevel === 'HIGH_DEMAND' && (
                      <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> High Peak Demand (+10%)
                      </span>
                    )}
                  </div>

                  {suggesting ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#E34234]" /> Calculating market demand & distance fare...
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-3xl font-black text-white">₹{suggestedPrice?.toLocaleString('en-IN') || 3000}</span>
                        <span className="text-xs text-slate-400 font-semibold ml-2">Suggested Rate / Day</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomPrice(suggestedPrice || 3000)}
                        className="text-xs font-extrabold text-[#E34234] hover:underline cursor-pointer"
                      >
                        Use Recommended Rate
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 font-medium border-t border-slate-800 pt-2">
                    💡 Based on route distance, vehicle category rates, and current passenger search volume.
                  </p>
                </div>

                {/* Driver Base Offered Price Input */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Your Base Offered Fare Per Day (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#E34234]" />
                    <input
                      type="number" required value={customPrice} onChange={e => setCustomPrice(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#E34234] focus:ring-2 focus:ring-[#E34234] outline-none text-slate-900 font-black text-xl bg-white"
                      placeholder="Enter your base price"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Base rate applies to standard daytime pickup windows unless slot overrides are set below.</p>
                </div>

                {/* CREATE 1-HOUR BANDWIDTH PICKUP TIME SLOT PRICING SECTION */}
                <div className="bg-red-50/80 p-4.5 rounded-2xl border-2 border-red-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase tracking-wider text-[#E34234] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Pickup Time-Based Multiple Prices
                    </label>
                    <span className="text-[10px] font-black bg-[#E34234] text-white px-2.5 py-0.5 rounded-full">
                      {slotPrices.length} Custom Slot Price(s) Set
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                    Set multiple rates for this listing depending on passenger pickup timing (1-hour slots):
                  </p>

                  {/* Inline Side-by-Side Row: Time Selector Box | Price Input Box | Add Button */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="md:col-span-6">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        1. Select Pickup Time Slot
                      </label>
                      <select
                        value={selectedSlotInput}
                        onChange={e => setSelectedSlotInput(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-900 bg-slate-50 outline-none focus:ring-2 focus:ring-[#E34234]"
                      >
                        {TIME_BANDWIDTH_SLOTS.map(s => (
                          <option key={s.slot} value={s.slot}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        2. Price for this Slot (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#E34234]" />
                        <input
                          type="number"
                          placeholder="e.g. 3800"
                          value={slotPriceInput}
                          onChange={e => setSlotPriceInput(e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-black text-slate-900 bg-white outline-none focus:ring-2 focus:ring-[#E34234]"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={handleAddSlotPrice}
                        className="w-full bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                      >
                        + Add Rate
                      </button>
                    </div>
                  </div>

                  {/* Display List of Configured Pickup Time Prices */}
                  {slotPrices.length > 0 ? (
                    <div className="space-y-1.5 pt-2 border-t border-red-200">
                      <span className="text-[10px] font-black uppercase text-slate-600 block">
                        Active Pickup Time Prices for this Listing:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {slotPrices.map((sp, idx) => (
                          <div key={idx} className="bg-white border border-red-200 p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#E34234] flex-shrink-0" />
                              <div>
                                <span className="text-xs font-black text-slate-900 block">{sp.label}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Slot Rate</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[#E34234]">₹{sp.price.toLocaleString('en-IN')}</span>
                              <button type="button" onClick={() => handleRemoveSlotPrice(sp.slot)} className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50" title="Remove slot rate">
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No custom time slot rates added yet. Base offered fare will apply to all times.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">Special Driver Notes (Optional)</label>
                  <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Clean vehicle, carrier rack available, flexible pickup time..." className="w-full border border-slate-300 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#E34234]" />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="text-slate-600 font-bold px-4 py-2 text-xs">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors shadow-md shadow-[#E34234]/20 flex items-center gap-1.5 cursor-pointer">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Publish Offer for ${selectedDates.length} Available Date(s)`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
