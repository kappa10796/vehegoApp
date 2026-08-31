"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Car, IndianRupee, Clock, ChevronRight, Loader2 } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json())
    ]).then(([authData, bookingData]) => {
      if (!authData.user) { router.push('/login'); return }
      setUser(authData.user)
      setBookings(bookingData.bookings || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>
  if (!user) return null

  const upcoming = bookings.filter(b => ['PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'TRIP_STARTED'].includes(b.status))
  const past = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(b.status))
  const totalSpent = bookings.filter(b => b.status === 'COMPLETED').reduce((s: number, b: any) => s + b.totalFare, 0)

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-black uppercase tracking-wider text-[#E34234]">Traveler Dashboard</span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">Welcome back, {user.name}!</h1>
          <p className="text-slate-500 font-semibold text-sm">Manage your upcoming mountain trips and bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-100"><Car className="w-5 h-5 text-[#E34234]" /></div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Total Trips</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100"><Clock className="w-5 h-5 text-amber-600" /></div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Upcoming</span>
            </div>
            <p className="text-3xl font-black text-slate-900">{upcoming.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100"><IndianRupee className="w-5 h-5 text-emerald-600" /></div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Total Spent</span>
            </div>
            <p className="text-3xl font-black text-slate-900">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Upcoming Trips */}
        <div className="mb-8">
          <h2 className="text-xl font-black text-slate-900 mb-4">Upcoming Trips</h2>
          {upcoming.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
              <p className="text-slate-500 font-medium mb-4">No upcoming trips booked yet.</p>
              <Link href="/" className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-2.5 rounded-xl transition-colors inline-block text-sm shadow-md shadow-[#E34234]/20">Book a Cab Now</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b: any) => (
                <Link key={b.id} href={`/dashboard/booking/${b.bookingId}`}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-red-200 hover:shadow-md transition-all flex items-center gap-4 group">
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
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
              <p className="text-slate-500 font-medium">No past trips recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {past.map((b: any) => (
                <Link key={b.id} href={`/dashboard/booking/${b.bookingId}`}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:shadow-sm transition-all flex items-center gap-4 group">
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
