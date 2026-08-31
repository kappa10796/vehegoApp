"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IndianRupee, Calendar, Users, ShieldAlert, TrendingUp, ArrowUpRight, Loader2
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(resData => {
        setData(resData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>
  }

  if (!data) return null

  const { stats, chartData, recentBookings } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-500 font-semibold text-sm mt-1">Real-time overview of booking revenue, active drivers, and system performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Gross Platform Fare</span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <div className="w-10 h-10 bg-red-50 text-[#E34234] rounded-xl flex items-center justify-center border border-red-100">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.totalBookings}</p>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase">All sectors & tour packages</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Active Verified Drivers</span>
            <div className="w-10 h-10 bg-red-50 text-[#E34234] rounded-xl flex items-center justify-center border border-red-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.activeDrivers}</p>
          <p className="text-xs text-emerald-600 font-bold mt-2 uppercase">Verified & Ready</p>
        </div>

        <Link href="/admin/drivers" className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200 shadow-sm hover:border-amber-400 transition-colors block group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider">Pending Verification</span>
            <div className="w-10 h-10 bg-amber-200/80 text-amber-900 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.pendingApprovals}</p>
          <div className="flex items-center gap-1 text-amber-800 text-xs font-extrabold mt-2 group-hover:underline uppercase">
            Review Applications <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Revenue & Booking Trends</h3>
            <p className="text-xs text-slate-400 font-semibold">Monthly booking volume and revenue trajectory (2026)</p>
          </div>
          <span className="text-xs font-black bg-red-50 text-[#E34234] px-3 py-1 rounded-full border border-red-100">Live Analytics</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E34234" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#E34234" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#E34234" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900">Recent Customer Bookings</h3>
          <Link href="/admin/bookings" className="text-sm font-extrabold text-[#E34234] hover:underline">
            View All Bookings
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Trip Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black text-[#E34234]">{b.bookingId}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{b.customer?.name}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{b.route ? `${b.route.origin} → ${b.route.destination}` : b.pickupLocation}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-semibold">{new Date(b.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">₹{b.totalFare.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
