"use client"
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Calendar, Users, Car, IndianRupee, ShieldCheck, Printer, ArrowLeft,
  Phone, User as UserIcon, CheckCircle2, AlertCircle, XCircle, Loader2, Banknote, Clock, Edit3
} from 'lucide-react'

const statusBadgeClass: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  DRIVER_ASSIGNED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  DRIVER_ARRIVING: 'bg-purple-100 text-purple-800 border-purple-300',
  TRIP_STARTED: 'bg-sky-100 text-sky-800 border-sky-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  REFUNDED: 'bg-slate-100 text-slate-800 border-slate-300',
}

function formatTime12h(timeStr: string) {
  if (!timeStr) return '09:00 AM'
  const parts = timeStr.split(':')
  const h = parseInt(parts[0] || '9', 10)
  const m = parts[1] || '00'
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12.toString().padStart(2, '0')}:${m} ${period}`
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [editPickupTime, setEditPickupTime] = useState('09:00')
  const [savingTime, setSavingTime] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.booking) {
          setBooking(data.booking)
          if (data.booking.pickupTime) setEditPickupTime(data.booking.pickupTime)
        } else {
          setError(data.error || 'Failed to load booking')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Network error')
        setLoading(false)
      })
  }, [id])

  const handleSavePickupTime = async () => {
    setSavingTime(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupTime: editPickupTime })
      })
      const data = await res.json()
      if (res.ok && data.booking) {
        setBooking(data.booking)
        setShowTimeModal(false)
      } else {
        alert(data.error || 'Failed to update pickup time')
      }
    } catch {
      alert('Error updating pickup time')
    } finally {
      setSavingTime(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      const data = await res.json()
      if (res.ok) {
        setBooking(data.booking)
      } else {
        alert(data.error || 'Could not cancel booking')
      }
    } catch {
      alert('Error cancelling booking')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#E34234]" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Not Found</h2>
          <p className="text-slate-500 mb-6">{error || 'The requested booking could not be loaded.'}</p>
          <Link href="/dashboard" className="bg-[#E34234] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#c93225] transition-colors inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const breakdown = booking.fareBreakdown ? JSON.parse(booking.fareBreakdown) : null
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status)
  const isCashOnCompletion = booking.payment?.paymentMethod === 'CASH_ON_COMPLETION' || booking.payment?.paymentMethod === 'PAY_AT_PICKUP'

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back()
              } else {
                router.push('/dashboard')
              }
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#E34234] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition-colors text-sm"
            >
              <Printer className="w-4 h-4 text-slate-500" /> Print Receipt
            </button>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-100 shadow-sm transition-colors text-sm disabled:opacity-50"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Cancel Ride
              </button>
            )}
          </div>
        </div>

        {/* Receipt Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
          {/* Header */}
          <div className="border-b border-slate-100 pb-6 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E34234]">VEHEGO Official Receipt</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Booking #{booking.bookingId}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusBadgeClass[booking.status] || 'bg-slate-100 text-slate-700'}`}>
                Ride: {booking.status.replace(/_/g, ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${booking.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                Payment: {booking.paymentStatus === 'PAID' ? 'PAID' : 'Cash on Completion'}
              </span>
            </div>
          </div>

          {/* Route & Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Route Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Pickup Location</p>
                    <p className="font-bold text-slate-900">{booking.pickupLocation}</p>
                  </div>
                </div>
                {booking.dropLocation && (
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Drop Location</p>
                      <p className="font-bold text-slate-900">{booking.dropLocation}</p>
                    </div>
                  </div>
                )}
                {booking.route && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>Est. Distance: {booking.route.distance} km</span>
                    <span>Est. Duration: {Math.floor(booking.route.duration / 60)}h {booking.route.duration % 60}m</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trip Information</h3>
                {['PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED'].includes(booking.status) && (
                  <button
                    onClick={() => setShowTimeModal(true)}
                    className="text-xs font-black text-[#E34234] hover:underline flex items-center gap-1 cursor-pointer bg-red-50 px-2.5 py-1 rounded-lg border border-red-100"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Pickup Time
                  </button>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Travel Date</span>
                  <span className="font-bold text-slate-900">{new Date(booking.tripDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4 text-[#E34234]" /> Scheduled Pickup Time</span>
                  <span className="font-extrabold text-[#E34234] bg-white px-2.5 py-0.5 rounded-lg border border-red-200">
                    {formatTime12h(booking.pickupTime || '09:00')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> Passengers</span>
                  <span className="font-bold text-slate-900">{booking.passengers} Seats</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-2"><Car className="w-4 h-4 text-slate-400" /> Trip Type</span>
                  <span className="font-bold text-slate-900 uppercase text-xs px-2 py-0.5 bg-slate-200 rounded">{booking.tripType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500 flex items-center gap-2"><Banknote className="w-4 h-4 text-slate-400" /> Payment Terms</span>
                  <span className="font-bold text-slate-900 text-xs px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                    {isCashOnCompletion ? 'Cash on Completion' : 'Prepaid Online'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Driver & Vehicle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Vehicle */}
            {(() => {
              const vehicle = booking.vehicle || booking.driverListing?.vehicle
              return (
                <div className="p-5 border border-slate-200 rounded-2xl bg-white">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Vehicle Details</span>
                  {vehicle ? (
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl bg-cover bg-center border border-slate-200 flex-shrink-0 shadow-xs" style={{ backgroundImage: `url("${vehicle.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600'}")` }}></div>
                      <div className="flex-1">
                        <h4 className="font-extrabold text-slate-900 text-lg leading-tight">{vehicle.brand} {vehicle.model}</h4>
                        <p className="text-xs font-bold text-[#E34234] uppercase tracking-wider mt-0.5">{vehicle.category} • {vehicle.seatingCapacity || 6} Seats Capacity</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md font-mono font-extrabold text-slate-800 border border-slate-200">{vehicle.registration || 'WB-74-COMMERCIAL'}</span>
                          <span className="bg-red-50 text-[#E34234] px-2.5 py-1 rounded-md font-extrabold border border-red-100">{vehicle.acStatus ? 'AC Vehicle' : 'Non-AC'}</span>
                          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md font-extrabold border border-emerald-100">Verified Hill Taxi</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Car className="w-8 h-8 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Mountain Commercial Fleet</p>
                        <p className="text-xs text-slate-500">Verified Taxi Assigned for Journey</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Driver */}
            <div className="p-5 border border-slate-200 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Assigned Driver</span>
              {booking.driver ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-[#E34234] font-bold flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{booking.driver.user?.name}</p>
                      <p className="text-xs text-slate-500">{booking.driver.experience} Years Hill Driving Exp.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 bg-emerald-50 text-emerald-800 p-2 rounded-lg">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact: {booking.driver.user?.phone || 'Shared 2 hrs before pickup'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500 italic mt-2">
                  <ShieldCheck className="w-4 h-4 text-[#E34234]" />
                  <span>Driver details will be dispatched 2 hours prior to journey.</span>
                </div>
              )}
            </div>
          </div>

          {/* Fare Breakdown Table */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Fare Breakdown</h3>
            {breakdown ? (
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Base Distance Fare</span>
                  <span>₹{breakdown.baseFare?.toLocaleString('en-IN') || breakdown.baseDistanceFare || 0}</span>
                </div>
                {breakdown.driverAllowance > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Driver Hill Allowance & Night Stay</span>
                    <span>₹{breakdown.driverAllowance?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {breakdown.tollEstimate > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tolls & Permit Charges</span>
                    <span>₹{breakdown.tollEstimate?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {breakdown.platformFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Service & Platform Fee</span>
                    <span>₹{breakdown.platformFee?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center font-bold text-lg text-slate-900">
                  <span>{booking.paymentStatus === 'PAID' ? 'Total Amount Paid' : 'Total Amount (Pay on Completion)'}</span>
                  <span className="text-[#E34234]">₹{booking.totalFare?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center font-bold text-lg text-slate-900">
                <span>Total Fare ({booking.paymentStatus === 'PAID' ? 'Paid' : 'Pay on Completion'})</span>
                <span className="text-[#E34234]">₹{booking.totalFare?.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-6">
            <p>VEHEGO Mobility Pvt Ltd • 24/7 Helpline: +91 98000 12345 • support@vehego.com</p>
          </div>
        </div>

        {/* EDIT PICKUP TIME MODAL */}
        {showTimeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#E34234]" /> Change Pickup Time
                </h3>
                <button onClick={() => setShowTimeModal(false)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
              </div>

              <p className="text-xs text-slate-500 font-medium mb-4">
                Select your new requested pickup time for Booking #{booking.bookingId}:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">New Pickup Time</label>
                  <input
                    type="time"
                    value={editPickupTime}
                    onChange={e => setEditPickupTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-base font-extrabold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#E34234] outline-none"
                  />
                  <span className="text-xs font-bold text-[#E34234] mt-1.5 block">
                    Selected Time: {formatTime12h(editPickupTime)}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '06:00 AM', time: '06:00' },
                      { label: '08:00 AM', time: '08:00' },
                      { label: '09:30 AM', time: '09:30' },
                      { label: '02:00 PM', time: '14:00' },
                      { label: '06:00 PM', time: '18:00' },
                      { label: '09:00 PM', time: '21:00' }
                    ].map(t => (
                      <button
                        key={t.time}
                        type="button"
                        onClick={() => setEditPickupTime(t.time)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer ${editPickupTime === t.time ? 'bg-[#E34234] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTimeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingTime}
                  onClick={handleSavePickupTime}
                  className="px-5 py-2.5 bg-[#E34234] hover:bg-[#c93225] text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#E34234]/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {savingTime ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save New Pickup Time'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
