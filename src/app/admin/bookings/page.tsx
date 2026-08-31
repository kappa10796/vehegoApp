"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Search, MapPin, User, Car, IndianRupee, Loader2 } from 'lucide-react'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = bookings.filter(b => {
    if (filter !== 'ALL' && b.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        b.bookingId?.toLowerCase().includes(q) ||
        b.customer?.name?.toLowerCase().includes(q) ||
        b.pickupLocation?.toLowerCase().includes(q)
      )
    }
    return true
  })

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">All Master Bookings</h1>
        <p className="text-slate-500 font-semibold text-sm mt-1">Audit, monitor, and inspect passenger trips across all mountain sectors.</p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'DRIVER_ASSIGNED', 'TRIP_STARTED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filter === s ? 'bg-[#E34234] text-white shadow-sm shadow-[#E34234]/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID / customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#E34234] outline-none"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Sector / Pickup</th>
                <th className="py-3 px-4">Travel Date</th>
                <th className="py-3 px-4">Vehicle Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Fare</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-[#E34234]">{b.bookingId}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    <div>{b.customer?.name}</div>
                    <div className="text-xs font-semibold text-slate-400">{b.customer?.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold">
                    {b.route ? `${b.route.origin} → ${b.route.destination}` : b.pickupLocation}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 font-semibold">{new Date(b.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="py-3.5 px-4 text-xs font-extrabold text-slate-700">{b.vehicle?.category || 'Standard Cab'}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">₹{b.totalFare.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/dashboard/booking/${b.bookingId}`} className="text-xs font-black text-[#E34234] hover:underline">
                      Receipt →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
