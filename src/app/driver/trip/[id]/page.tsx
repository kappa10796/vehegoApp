"use client"
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Phone, User, Calendar, Navigation, ShieldCheck, ArrowLeft,
  CheckCircle2, Clock, Play, AlertCircle, Loader2
} from 'lucide-react'

export default function DriverTripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/driver/trip/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.booking) {
          setBooking(data.booking)
        } else {
          setError(data.error || 'Failed to load trip details')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Network error')
        setLoading(false)
      })
  }, [id])

  const updateTripStatus = async (nextStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/driver/trip/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      const data = await res.json()
      if (res.ok) {
        setBooking(data.booking)
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch {
      alert('Error updating trip status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Trip Not Found</h2>
          <p className="text-slate-500 mb-6 font-medium">{error || 'Could not load requested trip details.'}</p>
          <Link href="/driver/dashboard" className="bg-[#E34234] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#c93225] inline-block text-sm shadow-md">
            Back to Driver Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { status } = booking

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back()
            } else {
              router.push('/driver/dashboard')
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700 hover:text-[#E34234] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Status Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Duty Ticket #{booking.bookingId}</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {booking.route ? `${booking.route.origin} → ${booking.route.destination}` : booking.pickupLocation}
            </h1>
          </div>

          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
            Current Status: {status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Action Controls for Driver */}
        <div className="bg-slate-950 p-6 md:p-8 rounded-3xl text-white shadow-xl mb-8 border-t-8 border-[#E34234]">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#E34234] mb-4">Driver Actions & Trip Controls</h3>
          
          <div className="flex flex-wrap items-center gap-4">
            {['PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED'].includes(status) && (
              <button
                onClick={() => updateTripStatus('DRIVER_ARRIVING')}
                disabled={updating}
                className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-[#E34234]/30 disabled:opacity-50 text-sm"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                Mark as &quot;Driver Arriving / En Route&quot;
              </button>
            )}

            {status === 'DRIVER_ARRIVING' && (
              <button
                onClick={() => updateTripStatus('TRIP_STARTED')}
                disabled={updating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50 text-sm"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                Start Journey (Passengers Boarded)
              </button>
            )}

            {status === 'TRIP_STARTED' && (
              <button
                onClick={() => updateTripStatus('COMPLETED')}
                disabled={updating}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50 text-base"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Complete Trip & Collect Payment
              </button>
            )}

            {status === 'COMPLETED' && (
              <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-500/30 px-5 py-3 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Trip Successfully Completed!
              </div>
            )}
          </div>
        </div>

        {/* Customer & Route Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Customer Details</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 text-[#E34234] rounded-2xl font-bold flex items-center justify-center border border-red-100">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-lg">{booking.customer?.name}</p>
                <p className="text-xs text-slate-500 font-semibold">{booking.customer?.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-[#E34234]" /> Contact Phone</span>
              <a href={`tel:${booking.customer?.phone}`} className="font-extrabold text-[#E34234] hover:underline">
                {booking.customer?.phone || '+91 98000 12345'}
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Pickup & Drop Off</h3>
              {booking.pickupTime && (
                <span className="text-xs font-black text-[#E34234] bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Pickup Time: {booking.pickupTime.includes('M') ? booking.pickupTime : (parseInt(booking.pickupTime.split(':')[0] || '9', 10) >= 12 ? `${(parseInt(booking.pickupTime.split(':')[0], 10) % 12 || 12).toString().padStart(2, '0')}:${booking.pickupTime.split(':')[1] || '00'} PM` : `${(parseInt(booking.pickupTime.split(':')[0], 10) % 12 || 12).toString().padStart(2, '0')}:${booking.pickupTime.split(':')[1] || '00'} AM`)}
                </span>
              )}
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-[#E34234] mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Pickup Location</p>
                <p className="font-extrabold text-slate-900">{booking.pickupLocation}</p>
              </div>
            </div>
            {booking.dropLocation && (
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Drop Off Location</p>
                  <p className="font-extrabold text-slate-900">{booking.dropLocation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
