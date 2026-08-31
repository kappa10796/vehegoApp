"use client"
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { ShieldCheck, MapPin, CheckCircle, ArrowRight, Loader2, AlertCircle, Banknote, CreditCard, QrCode, Clock, Edit3, Calendar, Users, Car } from 'lucide-react'

function BookingWizardContent() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const routeId = searchParams.get('routeId')
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const passengers = searchParams.get('passengers') || '1'
  const timeParam = searchParams.get('time') || '09:00'
  const driverListingId = searchParams.get('driverListingId')
  const searchTotalFare = searchParams.get('totalFare')
  const searchPickup = searchParams.get('pickup')
  const searchDrop = searchParams.get('drop')

  const router = useRouter()

  const [step, setStep] = useState(1)
  const [data, setData] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')

  function formatTime12h(timeStr: string) {
    if (!timeStr) return '09:00 AM'
    const parts = timeStr.split(':')
    const h = parseInt(parts[0] || '9', 10)
    const m = parts[1] || '00'
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12.toString().padStart(2, '0')}:${m} ${period}`
  }

  // Form State
  const [pickupTime, setPickupTime] = useState(timeParam)
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropAddress, setDropAddress] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_COMPLETION')

  useEffect(() => {
    // Check auth
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(d => {
        if (!d.user) {
          router.push(`/login?redirect=/booking/${id}?routeId=${routeId || ''}&date=${date}&passengers=${passengers}&driverListingId=${driverListingId || ''}`)
        } else {
          setUser(d.user)
        }
      })

    // Fetch details
    fetch(`/api/cabs/${id}?routeId=${routeId || ''}&driverListingId=${driverListingId || ''}&time=${encodeURIComponent(pickupTime)}&totalFare=${searchTotalFare || ''}`)
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, routeId, router, date, passengers, driverListingId, pickupTime, searchTotalFare])

  const handleBooking = async () => {
    setSubmitting(true)
    setBookingError('')

    const totalFareVal = data?.fare?.totalFare || Number(searchTotalFare) || 2500

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: data?.vehicle?.id || id,
          routeId: routeId || undefined,
          driverListingId: driverListingId || undefined,
          date,
          pickupTime,
          passengers,
          pickupAddress: pickupAddress || searchPickup || 'Main Pickup Point',
          dropAddress: dropAddress || searchDrop || 'Main Destination Point',
          specialInstructions,
          paymentMethod,
          totalFare: totalFareVal,
          fareBreakdown: data?.fare || { totalFare: totalFareVal }
        })
      })

      const responseData = await res.json()
      if (res.ok && responseData.booking) {
        router.push(`/dashboard/booking/${responseData.booking.bookingId}`)
      } else {
        setBookingError(responseData.error || 'Failed to create booking. Please try again.')
        setSubmitting(false)
      }
    } catch {
      setBookingError('Server error creating booking. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 gap-2"><Loader2 className="w-6 h-6 animate-spin text-[#E34234]" /> Loading trip summary...</div>

  const vehicle = data?.vehicle || {
    brand: 'Mahindra',
    model: 'Bolero Neo / SUV',
    category: 'SUV',
    seatingCapacity: 6,
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'
  }

  const route = data?.route || {
    origin: searchPickup || 'Siliguri',
    destination: searchDrop || 'Gangtok'
  }

  const fare = data?.fare || {
    baseFare: Number(searchTotalFare) || 2500,
    driverAllowance: 0,
    tollEstimate: 0,
    platformFee: 0,
    totalFare: Number(searchTotalFare) || 2500
  }

  const paymentOptions = [
    {
      id: 'CASH_ON_COMPLETION',
      name: 'Cash / Pay to Driver on Completion',
      desc: 'Pay the driver directly in cash or UPI after your mountain journey is safely completed.',
      badge: 'Zero Advance Required',
      icon: Banknote
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-between relative px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0 rounded-full"></div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#E34234] z-0 rounded-full transition-all" style={{ width: `${(step - 1) * 48}%` }}></div>
          
          {[
            { num: 1, label: 'Trip Details' },
            { num: 2, label: 'Review' },
            { num: 3, label: 'Payment Method' }
          ].map(s => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 ${step >= s.num ? 'bg-[#E34234] border-[#E34234] text-white shadow-md shadow-[#E34234]/20' : 'bg-white border-slate-300 text-slate-400'}`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={`mt-2 text-xs font-black uppercase tracking-wider ${step >= s.num ? 'text-slate-900' : 'text-slate-500'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {bookingError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-extrabold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" /> {bookingError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            
            {step === 1 && (
              <div className="space-y-6">
                {/* TRAVEL DETAILS HEADER CARD */}
                <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-lg border-l-8 border-[#E34234] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-[#E34234] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {data?.driverListing ? 'Driver Direct Deal' : 'Confirmed Cab Sector'}
                      </span>
                      {data?.driverListing?.driver?.user?.name && (
                        <span className="text-xs font-bold text-slate-300">
                          Driver: <strong className="text-white">{data.driverListing.driver.user.name}</strong>
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                      {route.origin} <span className="text-[#E34234]">→</span> {route.destination}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#E34234]" /> Date: {date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#E34234]" /> Pickup Time: {formatTime12h(pickupTime)}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#E34234]" /> {passengers} Passengers</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-right min-w-[200px] w-full md:w-auto">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Assigned Vehicle</span>
                    <span className="text-base font-black text-white block mt-0.5">{vehicle.brand} {vehicle.model}</span>
                    <span className="text-xs text-[#E34234] font-extrabold">{vehicle.category} ({vehicle.seatingCapacity} Seater)</span>
                  </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-black text-slate-900 mb-6">Passenger & Pickup Details</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">Lead Passenger</label>
                    <input type="text" disabled value={user.name} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-100 text-slate-900 font-extrabold" />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">Pickup Address / Hotel Name *</label>
                    <textarea required value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E34234] outline-none text-slate-900 font-bold bg-white text-base placeholder:text-slate-400" rows={3} placeholder="E.g., Mayfair Resort, Darjeeling" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">Drop Address (Optional)</label>
                    <textarea value={dropAddress} onChange={e => setDropAddress(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E34234] outline-none text-slate-900 font-bold bg-white text-base placeholder:text-slate-400" rows={2} placeholder="E.g., Bagdogra Airport Terminal" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">Special Instructions (Optional)</label>
                    <input type="text" value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E34234] outline-none text-slate-900 font-bold bg-white text-base placeholder:text-slate-400" placeholder="E.g., Traveling with elderly, need extra trunk space" />
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={() => {
                    if(!pickupAddress) return alert("Pickup address is required")
                    setStep(2)
                  }} className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md shadow-[#E34234]/20 text-sm cursor-pointer">
                    Review Booking <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

            {step === 2 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-black text-slate-900 mb-6">Review Your Booking</h2>
                
                <div className="border border-slate-200 rounded-2xl p-5 mb-6 bg-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Selected Vehicle Details</span>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-cover bg-center border border-slate-200 flex-shrink-0 shadow-xs" style={{ backgroundImage: `url("${vehicle.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'}")` }}></div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-xs font-bold text-[#E34234] uppercase tracking-wider mt-0.5">{vehicle.category} • {vehicle.seatingCapacity || 6} Seats Capacity</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-white px-2.5 py-1 rounded-md font-mono font-extrabold text-slate-800 border border-slate-200">{vehicle.registration || 'WB-74-COMMERCIAL'}</span>
                        <span className="bg-red-50 text-[#E34234] px-2.5 py-1 rounded-md font-extrabold border border-red-100">{vehicle.acStatus ? 'AC Vehicle' : 'Non-AC'}</span>
                        <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md font-extrabold border border-emerald-100">Verified Mountain Taxi</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Date & Pickup Time</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{date} at {formatTime12h(pickupTime)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Passengers</p>
                    <p className="font-extrabold text-slate-900">{passengers} Passengers</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                    <p className="text-xs text-[#E34234] uppercase font-black">Pickup Location</p>
                    <p className="font-extrabold text-slate-900">{route.origin}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{pickupAddress}</p>
                  </div>
                  {dropAddress && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-xs text-slate-500 uppercase font-black">Drop Location</p>
                      <p className="font-extrabold text-slate-900">{route.destination}</p>
                      <p className="text-sm font-semibold text-slate-700 mt-1">{dropAddress}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                  <button onClick={() => setStep(1)} className="text-slate-600 hover:text-slate-900 font-bold text-sm">Back</button>
                  <button onClick={() => setStep(3)} className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md text-sm shadow-[#E34234]/20 cursor-pointer">
                    Proceed to Payment <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-black text-slate-900 mb-1">Select Payment Preference</h2>
                <p className="text-xs text-slate-500 font-semibold mb-6">Choose how you wish to settle your fare for this journey.</p>
                
                <div className="space-y-3 mb-8">
                  {paymentOptions.map(opt => {
                    const Icon = opt.icon
                    const isSelected = paymentMethod === opt.id
                    return (
                      <label key={opt.id} className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-[#E34234] bg-red-50/40 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                        <input type="radio" name="payment" checked={isSelected} onChange={() => setPaymentMethod(opt.id)} className="text-[#E34234] w-5 h-5 focus:ring-[#E34234] accent-[#E34234] mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-[#E34234]' : 'text-slate-500'}`} />
                            <span className="font-extrabold text-slate-900 text-sm">{opt.name}</span>
                            {opt.badge && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-semibold">{opt.desc}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex gap-3 mb-8">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-emerald-900 font-bold">Instant Booking Confirmation</p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 leading-relaxed">
                      {paymentMethod === 'CASH_ON_COMPLETION' 
                        ? 'Your ride will be confirmed immediately. You only pay after your trip is completed directly to the driver.' 
                        : 'Your ride will be confirmed immediately upon payment processing.'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                  <button onClick={() => setStep(2)} className="text-slate-600 hover:text-slate-900 font-bold text-sm">Back</button>
                  <button
                    onClick={handleBooking} disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-black py-3.5 px-8 rounded-xl flex items-center gap-2 shadow-md text-base cursor-pointer transition-colors"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : paymentMethod === 'CASH_ON_COMPLETION' ? (
                      `Confirm Booking (Pay ₹${fare.totalFare.toLocaleString('en-IN')} Cash on Completion)`
                    ) : (
                      `Pay ₹${fare.totalFare.toLocaleString('en-IN')} & Confirm`
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-24 border-t-8 border-[#E34234]">
              <h3 className="font-black mb-4 text-lg border-b border-slate-800 pb-3">Fare Summary</h3>
              <div className="space-y-3 text-sm text-slate-300 font-medium">
                <div className="flex justify-between">
                  <span>Base Fare</span>
                  <span>₹{fare.baseFare.toLocaleString('en-IN')}</span>
                </div>
                {fare.driverAllowance > 0 && (
                  <div className="flex justify-between">
                    <span>Driver Allowance</span>
                    <span>₹{fare.driverAllowance.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {fare.tollEstimate > 0 && (
                  <div className="flex justify-between">
                    <span>Tolls Est.</span>
                    <span>₹{fare.tollEstimate.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {fare.platformFee > 0 && (
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>₹{fare.platformFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between font-black text-2xl text-white">
                  <span>Total Fare</span>
                  <span className="text-[#E34234]">₹{fare.totalFare.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function BookingWizard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading trip summary...</div>}>
      <BookingWizardContent />
    </Suspense>
  )
}
