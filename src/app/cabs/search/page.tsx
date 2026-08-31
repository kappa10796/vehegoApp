"use client"
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Users, CheckCircle, ShieldCheck, Snowflake, MapPin, Sparkles, Tag, Car, ArrowRight, Clock, Moon, Sun, Filter, Loader2, Star, Shield } from 'lucide-react'
import Link from 'next/link'

function formatTime12h(timeStr: string) {
  if (!timeStr) return '09:00 AM'
  const parts = timeStr.split(':')
  const h = parseInt(parts[0] || '9', 10)
  const m = parts[1] || '00'
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12.toString().padStart(2, '0')}:${m} ${period}`
}

function getTimeSlotCategory(timeStr: string) {
  if (!timeStr) return 'MORNING'
  const h = parseInt(timeStr.split(':')[0] || '9', 10)
  if (h >= 5 && h < 12) return 'MORNING'
  if (h >= 12 && h < 18) return 'AFTERNOON'
  if (h >= 18 && h < 21) return 'EVENING'
  return 'NIGHT'
}

function getVehicleImageUrl(vehicle?: any) {
  if (vehicle?.imageUrl) return vehicle.imageUrl
  const cat = (vehicle?.category || '').toUpperCase()
  if (cat.includes('HATCHBACK')) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
  if (cat.includes('SEDAN')) return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80'
  if (cat.includes('PREMIUM')) return 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop&q=80'
  return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80'
}

function SearchResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const origin = searchParams.get('origin') || 'Siliguri'
  const destination = searchParams.get('destination') || 'Gangtok'
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const passengers = searchParams.get('passengers') || '2'
  const initialTime = searchParams.get('time') || '09:00'

  const [pickupTime, setPickupTime] = useState(initialTime)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [activeSlotFilter, setActiveSlotFilter] = useState<string>('ALL')

  const [results, setResults] = useState<any[]>([])
  const [driverListings, setDriverListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Fetch standard search results strictly filtering by origin, destination, date, pickupTime, passengers
    fetch(`/api/cabs/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(pickupTime)}&passengers=${passengers}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || [])
      })
      .catch(() => {})

    // Fetch driver custom direct listings strictly filtering by origin, destination, date, pickupTime, passengers
    fetch(`/api/cabs/driver-listings?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(pickupTime)}&passengers=${passengers}`)
      .then(res => res.json())
      .then(data => {
        setDriverListings(data.listings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [origin, destination, date, passengers, pickupTime])

  const handleTimeChange = (newTime: string) => {
    setPickupTime(newTime)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('time', newTime)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const isNight = () => {
    const h = parseInt(pickupTime.split(':')[0] || '9', 10)
    return h >= 20 || h < 6
  }

  const currentSlot = getTimeSlotCategory(pickupTime)

  // Category Filtering
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const filteredResults = results.filter((res: any) => {
    if (selectedCategories.length > 0) {
      const cat = res.vehicle?.category
      const matches = selectedCategories.includes(cat) ||
        (selectedCategories.includes('PREMIUM_SUV') && cat === 'PREMIUM SUV') ||
        (selectedCategories.includes('PREMIUM SUV') && cat === 'PREMIUM_SUV')
      if (!matches) return false
    }
    return true
  })

  const filteredDriverListings = driverListings.filter((dl: any) => {
    if (selectedCategories.length > 0) {
      const cat = dl.vehicle?.category
      if (!cat) return true
      const matches = selectedCategories.includes(cat) ||
        (selectedCategories.includes('PREMIUM_SUV') && cat === 'PREMIUM SUV') ||
        (selectedCategories.includes('PREMIUM SUV') && cat === 'PREMIUM_SUV')
      return matches
    }
    return true
  })

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Summary */}
        <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-md mb-6 flex flex-col md:flex-row items-center justify-between border-l-8 border-[#E34234]">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3">
              {origin} <span className="text-[#E34234]">→</span> {destination}
            </h1>
            <p className="text-slate-300 mt-2 text-sm font-semibold flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#E34234]" /> {date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#E34234]" /> Pickup: {formatTime12h(pickupTime)}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#E34234]" /> {passengers} Passengers</span>
            </p>
          </div>
          <Link href="/" className="mt-4 md:mt-0 bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl text-white font-bold border border-white/20 transition-colors text-sm">
            Modify Search
          </Link>
        </div>

        {/* PICKUP TIME & CAR TYPE TOP FILTER BAR */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 space-y-5">
          {/* Row 1: Pickup Time Slot */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 text-[#E34234] rounded-2xl border border-red-100">
                <Clock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">Select Pickup Time Slot</h3>
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-[#E34234]" />}
                </div>
                <p className="text-xs text-slate-500 font-semibold">Select a time slot to see updated dynamic driver rates for {formatTime12h(pickupTime)}</p>
              </div>
            </div>

            {/* Time Picker & Preset Slot Buttons */}
            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto scrollbar-none touch-scroll pb-1">
              <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-2xl border border-slate-200 flex-shrink-0">
                <span className="text-xs font-black text-slate-600 uppercase">CUSTOM TIME:</span>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={e => handleTimeChange(e.target.value)}
                  className="bg-white px-3 py-1 rounded-xl text-slate-900 font-extrabold text-sm border border-slate-300 outline-none cursor-pointer focus:ring-2 focus:ring-[#E34234]"
                />
              </div>

              {[
                { slot: 'EARLY', label: '🌅 06:00 AM', time: '06:00' },
                { slot: 'DAWN', label: '🌄 07:00 AM', time: '07:00' },
                { slot: 'MORNING', label: '☕ 08:00 AM', time: '08:00' },
                { slot: 'PEAK', label: '☀️ 09:00 AM', time: '09:00' },
                { slot: 'AFTERNOON', label: '🌤️ 01:00 PM', time: '13:00' },
                { slot: 'EVENING', label: '🌆 05:00 PM', time: '17:00' },
                { slot: 'NIGHT', label: '🌙 09:00 PM', time: '21:00' },
              ].map(item => (
                <button
                  key={item.slot}
                  type="button"
                  onClick={() => handleTimeChange(item.time)}
                  className={`text-xs font-extrabold px-3 py-2 rounded-2xl border transition-all cursor-pointer flex-shrink-0 ${
                    pickupTime === item.time || (pickupTime.startsWith(item.time.split(':')[0]))
                      ? 'bg-[#E34234] text-white border-[#E34234] shadow-md shadow-[#E34234]/30 font-black scale-105'
                      : 'bg-slate-50 hover:bg-red-50 hover:text-[#E34234] text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Compact Car Type Filter Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-[#E34234]" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Cab Type:</span>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none touch-scroll pb-1">
              {[
                { id: 'ALL', label: 'All Cabs' },
                { id: 'HATCHBACK', label: 'Hatchback' },
                { id: 'SEDAN', label: 'Sedan' },
                { id: 'SUV', label: 'SUV' },
                { id: 'PREMIUM_SUV', label: 'Premium SUV' }
              ].map(cat => {
                const isActive = cat.id === 'ALL'
                  ? selectedCategories.length === 0
                  : selectedCategories.includes(cat.id) || (cat.id === 'PREMIUM_SUV' && (selectedCategories.includes('PREMIUM_SUV') || selectedCategories.includes('PREMIUM SUV')))
                
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (cat.id === 'ALL') {
                        setSelectedCategories([])
                      } else if (cat.id === 'PREMIUM_SUV') {
                        setSelectedCategories(['PREMIUM_SUV', 'PREMIUM SUV'])
                      } else {
                        setSelectedCategories([cat.id])
                      }
                    }}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-extrabold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Night Driver Notice */}
          {isNight() && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Night Departure Selected ({formatTime12h(pickupTime)}): 24/7 Verified Mountain Commercial Drivers assigned with late-night safety check.</span>
            </div>
          )}
        </div>

        {/* DRIVER DIRECT CUSTOM OFFERS SECTION */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-100 text-[#E34234] rounded-xl"><Sparkles className="w-5 h-5" /></span>
              <h2 className="text-xl font-black text-slate-900">Driver Direct Custom Offers</h2>
              <span className="text-xs font-black bg-red-50 text-[#E34234] px-3 py-1 rounded-full border border-red-200 uppercase tracking-wider">Driver Price Choice</span>
            </div>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-xs font-extrabold text-[#E34234] hover:underline"
              >
                Clear Car Type Filter ({selectedCategories[0]})
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 font-bold text-slate-500">
              Searching available driver deals for {formatTime12h(pickupTime)}...
            </div>
          ) : filteredDriverListings.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center border border-slate-200 shadow-sm">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-800">No Driver Custom Deals Found</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1 max-w-md mx-auto">
                There are currently no direct driver deals available matching your selected pickup time ({formatTime12h(pickupTime)}) and vehicle category filter.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Clear Car Type Filter
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredDriverListings.map((dl) => {
                const currentPrice = dl.activePrice || dl.customPrice
                const originalPrice = dl.customPrice > currentPrice ? dl.customPrice : (dl.suggestedPrice > currentPrice ? dl.suggestedPrice : null)
                const discountPct = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0
                const vehicleImg = getVehicleImageUrl(dl.vehicle)
                const isUploadedImage = Boolean(dl.vehicle?.imageUrl)

                return (
                  <div key={dl.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-stretch justify-between gap-6 group">
                    {/* LEFT COLUMN: Cab / Vehicle Photo */}
                    <div className="w-full md:w-60 h-48 md:h-auto relative flex-shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group-hover:border-red-200 transition-colors">
                      <img
                        src={vehicleImg}
                        alt={dl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#E34234]" /> {dl.vehicle?.category || 'CAB'}
                        </span>
                        {isUploadedImage && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-lg shadow-sm">
                            📷 Driver Uploaded Photo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MIDDLE COLUMN: Cab Title & Flipkart Specs Bullet List */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-[#E34234] transition-colors">
                            {dl.title}
                          </h3>
                        </div>

                        {/* Rating & Assured Badge */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            4.8 <Star className="w-3 h-3 fill-white stroke-none" />
                          </span>
                          <span className="text-xs font-bold text-slate-500">124+ Verified Ratings</span>
                          <span className="text-[10px] font-black uppercase bg-red-50 text-[#E34234] px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> VeheGo Assured
                          </span>
                        </div>

                        {/* Description Bullet List (Flipkart Format) */}
                        <ul className="space-y-1 text-xs font-semibold text-slate-700">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span><strong>Vehicle Model:</strong> {dl.vehicle?.brand} {dl.vehicle?.model} ({dl.vehicle?.category})</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span><strong>Pickup Bandwidth Window:</strong> {formatTime12h(pickupTime)} (1-Hour Slot Guaranteed)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span><strong>Capacity & Comfort:</strong> Max {dl.vehicle?.seatingCapacity || 4} Passengers • {dl.vehicle?.acStatus ? 'Air Conditioned (AC)' : 'Non-AC'}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span><strong>Commercial Driver:</strong> {dl.driver?.user?.name || 'Verified Driver'} (Verified Hill Specialist)</span>
                          </li>
                          {dl.isCustomSlot && (
                            <li className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 w-fit">
                              ⚡ Dynamic 1-Hour Time Slot Rate Active for {dl.activeSlotLabel}!
                            </li>
                          )}
                          {dl.notes && (
                            <li className="flex items-center gap-2 text-slate-500 italic">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>&quot;{dl.notes}&quot;</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Price & Flipkart Call to Action */}
                    <div className="flex flex-col justify-between items-start md:items-end md:text-right border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[210px] flex-shrink-0">
                      <div>
                        <div className="flex items-baseline gap-2 md:justify-end">
                          <span className="text-3xl font-black text-slate-900">₹{currentPrice.toLocaleString('en-IN')}</span>
                          {originalPrice && (
                            <span className="text-sm font-bold text-slate-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        {discountPct > 0 ? (
                          <span className="text-xs font-extrabold text-emerald-600 block mt-0.5">
                            {discountPct}% off Time Slot Special!
                          </span>
                        ) : (
                          <span className="text-xs font-extrabold text-emerald-600 block mt-0.5">⚡ Best Direct Driver Price</span>
                        )}
                        <span className="text-[11px] text-slate-400 block mt-1">Includes Tolls, Fuel & Driver Allowance</span>
                      </div>

                      <Link
                        href={`/booking/driver-listing-${dl.id}?vehicleId=${dl.vehicleId || ''}&driverListingId=${dl.id}&totalFare=${currentPrice}&date=${date}&time=${encodeURIComponent(pickupTime)}&passengers=${passengers}&pickup=${encodeURIComponent(origin)}&drop=${encodeURIComponent(destination)}`}
                        className="mt-4 w-full md:w-auto bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md shadow-[#E34234]/20 flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                        Book Driver Deal <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CabSearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-extrabold text-slate-500">Loading Cab Search...</div>}>
      <SearchResultsContent />
    </Suspense>
  )
}
