"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Car, Power, MapPin, Calendar, IndianRupee, ShieldAlert, CheckCircle2,
  Clock, ArrowRight, Loader2, Navigation, AlertTriangle, Compass, Plus, Tag
} from 'lucide-react'

export default function DriverDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/driver/dashboard')
      .then(res => res.json())
      .then(resData => {
        if (!resData.driver) {
          router.push('/driver/register')
        } else {
          setData(resData)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const toggleAvailability = async () => {
    if (!data?.driver) return
    setToggling(true)
    const newStatus = data.driver.availability === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE'
    try {
      const res = await fetch('/api/driver/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: newStatus })
      })
      const result = await res.json()
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          driver: { ...prev.driver, availability: result.driver.availability }
        }))
      }
    } catch {
      alert('Error updating status')
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-[#E34234]" /></div>
  }

  if (!data || !data.driver) return null

  const { driver, stats, assignedBookings, upcomingTrips } = data
  const isApproved = driver.status === 'APPROVED'

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Driver Status Banner */}
        {!isApproved && (
          <div className="mb-8 bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
            <ShieldAlert className="w-8 h-8 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-amber-900">Application Pending Admin Approval</h2>
              <p className="text-sm text-amber-700 mt-1">
                Your driver license (<strong className="font-semibold">{driver.licenseNumber}</strong>) and vehicle registration are being reviewed by the VEHEGO operations team.
              </p>
              <span className="inline-block mt-3 bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Status: {driver.status}
              </span>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#E34234]">VEHEGO Partner Driver Dashboard</span>
            <h1 className="text-3xl font-black text-slate-900 mt-0.5">{driver.user?.name}</h1>
            <p className="text-sm text-slate-500 font-semibold">{driver.vehicles?.[0]?.brand} {driver.vehicles?.[0]?.model} • {driver.vehicles?.[0]?.registration}</p>
          </div>

          {isApproved && (
            <button
              onClick={toggleAvailability}
              disabled={toggling}
              className={`px-6 py-3 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-sm transition-all ${
                driver.availability === 'AVAILABLE'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              {toggling ? 'Updating...' : driver.availability === 'AVAILABLE' ? 'ONLINE (AVAILABLE FOR RIDES)' : 'OFFLINE'}
            </button>
          )}
        </div>

        {/* DRIVER CUSTOM RIDES & SIGHTSEEING QUICK BANNER */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl mb-8 border-l-8 border-[#E34234] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-[#E34234]" /> Driver Custom Offers & Sightseeing
            </div>
            <h2 className="text-2xl font-black text-white">Publish Custom Rides & Tour Packages</h2>
            <p className="text-slate-300 text-sm font-medium mt-1 max-w-xl">
              List your own custom routes from source to destination with your own price choice. Get dynamic price guidance based on ongoing demand & standard sector fares.
            </p>
          </div>

          {isApproved ? (
            <Link
              href="/driver/listings"
              className="bg-[#E34234] hover:bg-[#c93225] text-white font-extrabold px-6 py-3.5 rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-[#E34234]/30 text-sm flex-shrink-0"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" /> Manage Custom Listings
            </Link>
          ) : (
            <div className="bg-amber-950/60 border border-amber-500/40 text-amber-300 font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Listings Feature Locked: Pending Approval
            </div>
          )}
        </div>

        {/* Driver Performance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Car className="w-4 h-4 text-[#E34234]" /> Completed Trips
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats?.totalTrips || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> Net Earnings (85%)
            </div>
            <p className="text-3xl font-extrabold text-slate-900">₹{(stats?.totalEarnings || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-amber-600" /> Active / Upcoming
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats?.upcomingCount || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600" /> Driver Rating
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats?.rating || 5.0} ★</p>
          </div>
        </div>

        {/* Assigned Trips Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Assigned Trips & Duty Schedule</h2>
          {assignedBookings.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No trip duties currently assigned to your vehicle.</p>
              <p className="text-xs text-slate-400 mt-1">Keep your status set to ONLINE to receive automatic route assignments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedBookings.map((b: any) => (
                <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        #{b.bookingId}
                      </span>
                      <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-red-100 text-[#E34234]">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#E34234]" />
                      {b.route ? `${b.route.origin} → ${b.route.destination}` : b.pickupLocation}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(b.tripDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>Customer: <strong>{b.customer?.name}</strong> ({b.customer?.phone || 'Hidden'})</span>
                      <span>Pax: {b.passengers} Seats</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Trip Fare</span>
                      <span className="text-2xl font-extrabold text-slate-900">₹{b.totalFare.toLocaleString('en-IN')}</span>
                    </div>

                    <Link
                      href={`/driver/trip/${b.bookingId}`}
                      className="bg-[#E34234] hover:bg-[#c93225] text-white font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 text-sm shadow-sm"
                    >
                      Trip Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
